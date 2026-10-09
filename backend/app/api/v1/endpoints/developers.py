from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user, require_admin
from app.services.developer_service import developer_service
from app.schemas.developer import DeveloperCreate, DeveloperUpdate
from typing import Optional

router = APIRouter()


@router.get("")
async def list_developers(
    skip: int = 0,
    limit: int = 50,
    availability: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    return await developer_service.list_developers(skip=skip, limit=limit, availability=availability)


@router.get("/available")
async def list_available_developers(current_user=Depends(get_current_user)):
    return await developer_service.get_available_developers()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_developer(data: DeveloperCreate, current_user=Depends(require_admin)):
    return await developer_service.create_developer(data, str(current_user["_id"]))


@router.get("/{user_id}")
async def get_developer(user_id: str, current_user=Depends(get_current_user)):
    role = current_user.get("role")
    if role != "ADMIN" and str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await developer_service.get_developer(user_id)


@router.put("/{user_id}")
async def update_developer(user_id: str, data: DeveloperUpdate, current_user=Depends(get_current_user)):
    role = current_user.get("role")
    if role != "ADMIN" and str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await developer_service.update_developer(user_id, data)


@router.delete("/{user_id}")
async def deactivate_developer(user_id: str, current_user=Depends(require_admin)):
    await developer_service.deactivate_developer(user_id)
    return {"message": "Developer deactivated"}


@router.get("/{user_id}/projects")
async def get_developer_projects(user_id: str, skip: int = 0, limit: int = 20, current_user=Depends(get_current_user)):
    role = current_user.get("role")
    if role != "ADMIN" and str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.repositories.project_repo import ProjectRepository
    repo = ProjectRepository()
    docs = await repo.get_by_developer(user_id, skip=skip, limit=limit)
    for d in docs:
        d["id"] = str(d["_id"])
    return docs
