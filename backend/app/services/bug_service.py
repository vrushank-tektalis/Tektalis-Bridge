from datetime import datetime
from typing import Optional, List
from fastapi import HTTPException

from app.repositories.bug_repo import BugRepository
from app.repositories.project_repo import ProjectRepository
from app.schemas.bug import BugCreate, BugUpdate
from app.utils.id_generator import generate_id
from app.services.activity_log_service import activity_log_service


class BugService:
    def __init__(self):
        self.repo = BugRepository()
        self.project_repo = ProjectRepository()

    def _serialize(self, doc: dict) -> dict:
        doc["id"] = str(doc["_id"])
        return doc

    async def _authorize_project(self, project_id: str, user_id: str, role: str):
        proj = await self.project_repo.get_by_id(project_id)
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")
        if role == "CLIENT" and proj["client_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if role == "DEVELOPER" and user_id not in proj.get("assigned_developers", []):
            raise HTTPException(status_code=403, detail="Not authorized")
        return proj

    async def create_bug(self, project_id: str, data: BugCreate, reporter_user_id: str, role: str) -> dict:
        await self._authorize_project(project_id, reporter_user_id, role)
        bug_id = await generate_id("BUG")
        doc = {
            "bug_id": bug_id,
            "project_id": project_id,
            "title": data.title,
            "description": data.description,
            "severity": data.severity,
            "priority": data.priority,
            "reported_by": reporter_user_id,
            "assigned_to": None,
            "status": "OPEN",
            "resolved_at": None,
        }
        result = await self.repo.create(doc)
        await activity_log_service.log(
            project_id=project_id,
            actor_id=reporter_user_id,
            action="BUG_REPORTED",
            description=f"Bug '{data.title}' reported",
            metadata={"bug_id": bug_id, "severity": data.severity},
        )
        return self._serialize(result)

    async def list_bugs(self, project_id: str, user_id: str, role: str, skip: int = 0, limit: int = 100) -> List[dict]:
        await self._authorize_project(project_id, user_id, role)
        docs = await self.repo.get_by_project(project_id, skip=skip, limit=limit)
        return [self._serialize(d) for d in docs]

    async def get_bug(self, bug_id: str, user_id: str, role: str) -> dict:
        bug = await self.repo.get_by_id(bug_id)
        if not bug:
            raise HTTPException(status_code=404, detail="Bug not found")
        await self._authorize_project(bug["project_id"], user_id, role)
        return self._serialize(bug)

    async def update_bug(self, bug_id: str, data: BugUpdate, user_id: str, role: str) -> dict:
        bug = await self.repo.get_by_id(bug_id)
        if not bug:
            raise HTTPException(status_code=404, detail="Bug not found")
        await self._authorize_project(bug["project_id"], user_id, role)
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        if data.status == "FIXED" or data.status == "CLOSED":
            update_dict["resolved_at"] = datetime.utcnow()
        result = await self.repo.update(bug_id, update_dict)
        if data.status and data.status != bug.get("status"):
            await activity_log_service.log(
                project_id=bug["project_id"],
                actor_id=user_id,
                action="BUG_STATUS_CHANGED",
                description=f"Bug '{bug['title']}' status changed to {data.status}",
                metadata={"bug_id": bug_id, "new_status": data.status},
            )
        return self._serialize(result)

    async def delete_bug(self, bug_id: str, user_id: str, role: str) -> bool:
        bug = await self.repo.get_by_id(bug_id)
        if not bug:
            raise HTTPException(status_code=404, detail="Bug not found")
        if role != "ADMIN":
            raise HTTPException(status_code=403, detail="Only admins can delete bugs")
        await self.repo.delete(bug_id)
        return True


bug_service = BugService()
