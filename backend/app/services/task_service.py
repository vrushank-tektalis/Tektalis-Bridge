import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import HTTPException

from app.repositories.task_repo import TaskRepository
from app.repositories.project_repo import ProjectRepository
from app.schemas.task import TaskCreate, TaskUpdate
from app.utils.id_generator import generate_id
from app.services.activity_log_service import activity_log_service


class TaskService:
    def __init__(self):
        self.repo = TaskRepository()
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

    async def create_task(self, project_id: str, data: TaskCreate, creator_user_id: str, role: str) -> dict:
        await self._authorize_project(project_id, creator_user_id, role)
        task_id = await generate_id("TSK")
        doc = {
            "task_id": task_id,
            "project_id": project_id,
            "title": data.title,
            "description": data.description,
            "priority": data.priority,
            "status": "TODO",
            "assigned_developer": data.assigned_developer,
            "due_date": data.due_date,
            "created_by": creator_user_id,
        }
        result = await self.repo.create(doc)
        await activity_log_service.log(
            project_id=project_id,
            actor_id=creator_user_id,
            action="TASK_CREATED",
            description=f"Task '{data.title}' created",
            metadata={"task_id": task_id},
        )
        return self._serialize(result)

    async def list_tasks(self, project_id: str, user_id: str, role: str, skip: int = 0, limit: int = 100) -> List[dict]:
        await self._authorize_project(project_id, user_id, role)
        docs = await self.repo.get_by_project(project_id, skip=skip, limit=limit)
        return [self._serialize(d) for d in docs]

    async def get_task(self, task_id: str, user_id: str, role: str) -> dict:
        task = await self.repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        await self._authorize_project(task["project_id"], user_id, role)
        return self._serialize(task)

    async def update_task(self, task_id: str, data: TaskUpdate, user_id: str, role: str) -> dict:
        task = await self.repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        await self._authorize_project(task["project_id"], user_id, role)
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await self.repo.update(task_id, update_dict)
        if data.status and data.status != task.get("status"):
            await activity_log_service.log(
                project_id=task["project_id"],
                actor_id=user_id,
                action="TASK_STATUS_CHANGED",
                description=f"Task '{task['title']}' status changed to {data.status}",
                metadata={"task_id": task_id, "new_status": data.status},
            )
        return self._serialize(result)

    async def delete_task(self, task_id: str, user_id: str, role: str) -> bool:
        task = await self.repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        if role not in ["ADMIN"]:
            raise HTTPException(status_code=403, detail="Only admins can delete tasks")
        await self.repo.delete(task_id)
        return True


task_service = TaskService()
