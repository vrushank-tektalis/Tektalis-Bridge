import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import HTTPException

from app.repositories.developer_request_repo import DeveloperRequestRepository
from app.repositories.project_repo import ProjectRepository
from app.repositories.developer_repo import DeveloperRepository
from app.schemas.developer_request import DeveloperRequestCreate, DeveloperRequestUpdate
from app.utils.id_generator import generate_id
from app.utils.constants import NotificationType


class DeveloperRequestService:
    def __init__(self):
        self.repo = DeveloperRequestRepository()
        self.project_repo = ProjectRepository()
        self.dev_repo = DeveloperRepository()

    def _serialize(self, doc: dict) -> dict:
        doc["id"] = str(doc["_id"])
        return doc

    async def create_request(
        self,
        project_id: str,
        developer_user_id: str,
        data: DeveloperRequestCreate,
        requested_by: Optional[str] = None,
    ) -> dict:
        proj = await self.project_repo.get_by_id(project_id)
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")

        # Check for existing pending request
        existing = await self.repo.find_existing(project_id, developer_user_id)
        if existing:
            raise HTTPException(status_code=400, detail="A pending request already exists for this project")

        # Check developer is not already assigned
        if developer_user_id in proj.get("assigned_developers", []):
            raise HTTPException(status_code=400, detail="Developer is already assigned to this project")

        request_id = await generate_id("REQ")
        doc = {
            "request_id": request_id,
            "project_id": project_id,
            "developer_id": developer_user_id,
            "requested_by": requested_by,
            "status": "PENDING",
            "message": data.message,
            "reviewed_at": None,
            "reviewed_by": None,
        }
        result = await self.repo.create(doc)

        # Notify admins
        try:
            from app.services.notification_service import notification_service
            from app.db.database import get_db
            db = get_db()
            admins = await db.users.find({"role": "ADMIN", "is_active": True, "is_deleted": False}).to_list(length=10)
            for admin in admins:
                await notification_service.create_notification(
                    user_id=str(admin["_id"]),
                    type=NotificationType.PROJECT,
                    title="New Developer Request",
                    message=f"A developer has requested to join project '{proj['title']}'",
                    project_id=project_id,
                    sender_id=developer_user_id,
                )
        except Exception:
            pass

        return self._serialize(result)

    async def list_requests(self, user_id: str, role: str, skip: int = 0, limit: int = 50) -> List[dict]:
        if role == "ADMIN":
            docs = await self.repo.get_all(skip=skip, limit=limit)
        else:
            docs = await self.repo.get_by_developer(user_id, skip=skip, limit=limit)
        return [self._serialize(d) for d in docs]

    async def get_request(self, request_id: str, user_id: str, role: str) -> dict:
        req = await self.repo.get_by_request_id(request_id)
        if not req:
            raise HTTPException(status_code=404, detail="Request not found")
        if role == "DEVELOPER" and req["developer_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        return self._serialize(req)

    async def review_request(self, request_id: str, data: DeveloperRequestUpdate, reviewer_user_id: str) -> dict:
        req = await self.repo.get_by_request_id(request_id)
        if not req:
            raise HTTPException(status_code=404, detail="Request not found")
        if req["status"] != "PENDING":
            raise HTTPException(status_code=400, detail="Request is no longer pending")

        update = {
            "status": data.status,
            "reviewed_at": datetime.utcnow(),
            "reviewed_by": reviewer_user_id,
        }
        result = await self.repo.update(str(req["_id"]), update)

        # If approved, assign developer to project
        if data.status == "APPROVED":
            try:
                from app.services.project_service import project_service
                await project_service.assign_developer(req["project_id"], req["developer_id"], reviewer_user_id)
            except Exception:
                pass

        # Notify developer
        try:
            from app.services.notification_service import notification_service
            proj = await self.project_repo.get_by_id(req["project_id"])
            project_name = proj["title"] if proj else req["project_id"]
            title = "Request Approved" if data.status == "APPROVED" else "Request Rejected"
            msg = (
                f"Your request to join project '{project_name}' has been approved!"
                if data.status == "APPROVED"
                else f"Your request to join project '{project_name}' was rejected."
            )
            await notification_service.create_notification(
                user_id=req["developer_id"],
                type=NotificationType.PROJECT,
                title=title,
                message=msg,
                project_id=req["project_id"],
                sender_id=reviewer_user_id,
            )
        except Exception:
            pass

        return self._serialize(result)

    async def cancel_request(self, request_id: str, developer_user_id: str) -> dict:
        req = await self.repo.get_by_request_id(request_id)
        if not req:
            raise HTTPException(status_code=404, detail="Request not found")
        if req["developer_id"] != developer_user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if req["status"] != "PENDING":
            raise HTTPException(status_code=400, detail="Only pending requests can be cancelled")
        result = await self.repo.update(str(req["_id"]), {"status": "CANCELLED"})
        return self._serialize(result)


developer_request_service = DeveloperRequestService()
