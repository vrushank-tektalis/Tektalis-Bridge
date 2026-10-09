import uuid
from datetime import datetime
from typing import Optional
from fastapi import HTTPException

from app.repositories.activity_log_repo import ActivityLogRepository


class ActivityLogService:
    def __init__(self):
        self.repo = ActivityLogRepository()

    async def log(
        self,
        project_id: Optional[str],
        actor_id: str,
        action: str,
        description: str,
        metadata: dict = None,
    ) -> dict:
        return await self.repo.create_log(project_id, actor_id, action, description, metadata)

    async def get_project_activity(self, project_id: str, skip: int = 0, limit: int = 50):
        docs = await self.repo.get_by_project(project_id, skip=skip, limit=limit)
        for d in docs:
            d["id"] = str(d["_id"])
        return docs


activity_log_service = ActivityLogService()
