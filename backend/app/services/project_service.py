import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import HTTPException

from app.repositories.project_repo import ProjectRepository
from app.repositories.base import UserRepository
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectStageUpdate, ProjectAssignDeveloper
from app.utils.id_generator import generate_id
from app.utils.constants import NotificationType


class ProjectService:
    def __init__(self):
        self.project_repo = ProjectRepository()
        self.user_repo = UserRepository()

    def _serialize(self, doc: dict) -> dict:
        if doc:
            doc["id"] = str(doc["_id"])
        return doc

    async def create_project(self, client_id: str, data: ProjectCreate) -> dict:
        project_id = await generate_id("PRJ")
        doc = {
            "project_id": project_id,
            "title": data.title,
            "description": data.description,
            "client_id": client_id,
            "status": "DRAFT",
            "current_stage": "DRAFT",
            "progress_percentage": 0.0,
            "start_date": None,
            "expected_completion_date": data.expected_completion_date,
            "actual_completion_date": None,
            "assigned_developers": [],
            "requirements": None,
        }
        result = await self.project_repo.create(doc)

        # Log activity
        try:
            from app.services.activity_log_service import activity_log_service
            await activity_log_service.log(
                project_id=str(result["_id"]),
                actor_id=client_id,
                action="PROJECT_CREATED",
                description=f"Project '{data.title}' created",
            )
        except Exception:
            pass

        return self._serialize(result)

    async def list_projects(self, user_id: str, role: str, skip: int = 0, limit: int = 50) -> List[dict]:
        if role == "CLIENT":
            docs = await self.project_repo.get_by_client(user_id, skip=skip, limit=limit)
        elif role == "DEVELOPER":
            docs = await self.project_repo.get_by_developer(user_id, skip=skip, limit=limit)
        else:  # ADMIN
            docs = await self.project_repo.get_all(skip=skip, limit=limit)
        return [self._serialize(d) for d in docs]

    async def get_project(self, project_id: str, user_id: str, role: str) -> dict:
        # Try by ObjectId first, then by project_id code
        from bson import ObjectId
        try:
            proj = await self.project_repo.get_by_id(project_id)
        except Exception:
            proj = await self.project_repo.get_by_project_id(project_id)

        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")

        if role == "CLIENT" and proj["client_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this project")
        if role == "DEVELOPER" and user_id not in proj.get("assigned_developers", []):
            raise HTTPException(status_code=403, detail="Not authorized to access this project")

        return self._serialize(proj)

    async def update_project(self, project_id: str, data: ProjectUpdate, admin_user_id: str) -> dict:
        proj = await self.project_repo.get_by_id(project_id)
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await self.project_repo.update(project_id, update_dict)
        return self._serialize(result)

    async def change_stage(self, project_id: str, data: ProjectStageUpdate, admin_user_id: str) -> dict:
        proj = await self.project_repo.get_by_id(project_id)
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")

        update: dict = {
            "current_stage": data.stage,
            "status": "ACTIVE",
        }
        if data.progress_percentage is not None:
            update["progress_percentage"] = data.progress_percentage
        if data.stage == "DEVELOPMENT" and not proj.get("start_date"):
            update["start_date"] = datetime.utcnow()
        if data.stage == "COMPLETED":
            update["actual_completion_date"] = datetime.utcnow()
            update["status"] = "COMPLETED"

        result = await self.project_repo.update(project_id, update)

        # Log + notify
        try:
            from app.services.activity_log_service import activity_log_service
            await activity_log_service.log(
                project_id=project_id,
                actor_id=admin_user_id,
                action="STAGE_CHANGED",
                description=f"Project stage changed to {data.stage}",
                metadata={"new_stage": data.stage, "notes": data.notes},
            )
            from app.services.notification_service import notification_service
            all_members = list(set(proj.get("assigned_developers", []) + [proj["client_id"]]))
            for uid in all_members:
                await notification_service.create_notification(
                    user_id=uid,
                    type=NotificationType.PROJECT,
                    title="Project Stage Updated",
                    message=f"Project '{proj['title']}' moved to {data.stage}",
                    project_id=project_id,
                    sender_id=admin_user_id,
                )
        except Exception:
            pass

        return self._serialize(result)

    async def assign_developer(self, project_id: str, developer_user_id: str, admin_user_id: str) -> dict:
        proj = await self.project_repo.get_by_id(project_id)
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")
        if developer_user_id in proj.get("assigned_developers", []):
            raise HTTPException(status_code=400, detail="Developer already assigned")

        devs = proj.get("assigned_developers", [])
        devs.append(developer_user_id)
        result = await self.project_repo.update(project_id, {"assigned_developers": devs})

        # Add developer to project chat rooms
        try:
            from app.services.chat_service import chat_service
            client_room = await chat_service.get_or_create_room(
                project_id=project_id,
                room_type="CLIENT_PROJECT",
                members=[proj["client_id"]] + devs,
            )
            await chat_service.add_member_to_room(client_room["room_id"], developer_user_id)

            dev_room = await chat_service.get_or_create_room(
                project_id=project_id,
                room_type="DEVELOPER_PROJECT",
                members=devs,
            )
            await chat_service.add_member_to_room(dev_room["room_id"], developer_user_id)

            # Add dev to org chat
            org_room = await chat_service.get_org_chat_room()
            if org_room:
                await chat_service.add_member_to_room(org_room["room_id"], developer_user_id)
        except Exception:
            pass

        # Notify developer
        try:
            from app.services.notification_service import notification_service
            await notification_service.create_notification(
                user_id=developer_user_id,
                type=NotificationType.PROJECT,
                title="Assigned to Project",
                message=f"You have been assigned to project '{proj['title']}'",
                project_id=project_id,
                sender_id=admin_user_id,
            )
        except Exception:
            pass

        try:
            from app.services.activity_log_service import activity_log_service
            await activity_log_service.log(
                project_id=project_id,
                actor_id=admin_user_id,
                action="DEVELOPER_ASSIGNED",
                description="Developer assigned to project",
                metadata={"developer_id": developer_user_id},
            )
        except Exception:
            pass

        return self._serialize(result)

    async def remove_developer(self, project_id: str, developer_user_id: str, admin_user_id: str) -> dict:
        proj = await self.project_repo.get_by_id(project_id)
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")
        devs = [d for d in proj.get("assigned_developers", []) if d != developer_user_id]
        result = await self.project_repo.update(project_id, {"assigned_developers": devs})
        return self._serialize(result)

    async def soft_delete_project(self, project_id: str) -> bool:
        await self.project_repo.delete(project_id)
        return True

    async def get_available_projects(self, skip: int = 0, limit: int = 50) -> List[dict]:
        docs = await self.project_repo.get_available_for_developers(skip=skip, limit=limit)
        return [self._serialize(d) for d in docs]

    async def set_requirements(self, project_id: str, requirements: dict, client_id: str) -> dict:
        """Store approved AI requirements against a project."""
        proj = await self.project_repo.get_by_id(project_id)
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")
        if proj["client_id"] != client_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        update = {
            "requirements": requirements,
            "status": "ACTIVE",
            "current_stage": "REQUIREMENT_ANALYSIS",
        }
        result = await self.project_repo.update(project_id, update)
        try:
            from app.services.activity_log_service import activity_log_service
            await activity_log_service.log(
                project_id=project_id,
                actor_id=client_id,
                action="REQUIREMENTS_APPROVED",
                description="Client approved AI-generated requirements",
            )
        except Exception:
            pass
        return self._serialize(result)


project_service = ProjectService()
