from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user, require_admin, require_client
from app.services.task_service import task_service
from app.schemas.task import TaskCreate, TaskUpdate

router = APIRouter()


@router.get("/projects/{project_id}/tasks")
async def list_tasks(project_id: str, skip: int = 0, limit: int = 100, current_user=Depends(get_current_user)):
    return await task_service.list_tasks(
        project_id=project_id,
        user_id=str(current_user["_id"]),
        role=current_user["role"],
        skip=skip,
        limit=limit,
    )


@router.post("/projects/{project_id}/tasks", status_code=status.HTTP_201_CREATED)
async def create_task(project_id: str, data: TaskCreate, current_user=Depends(get_current_user)):
    if current_user["role"] == "CLIENT":
        raise HTTPException(status_code=403, detail="Clients cannot create tasks")
    return await task_service.create_task(
        project_id=project_id,
        data=data,
        creator_user_id=str(current_user["_id"]),
        role=current_user["role"],
    )


@router.get("/tasks/{task_id}")
async def get_task(task_id: str, current_user=Depends(get_current_user)):
    return await task_service.get_task(task_id, str(current_user["_id"]), current_user["role"])


@router.put("/tasks/{task_id}")
async def update_task(task_id: str, data: TaskUpdate, current_user=Depends(get_current_user)):
    return await task_service.update_task(task_id, data, str(current_user["_id"]), current_user["role"])


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user=Depends(require_admin)):
    await task_service.delete_task(task_id, str(current_user["_id"]), current_user["role"])
    return {"message": "Task deleted"}
