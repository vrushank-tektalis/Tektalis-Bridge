from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user, require_admin
from app.services.client_service import client_service
from app.schemas.client import ClientCreate, ClientUpdate
from typing import List, Optional

router = APIRouter()


@router.get("")
async def list_clients(skip: int = 0, limit: int = 50, current_user=Depends(require_admin)):
    return await client_service.list_clients(skip=skip, limit=limit)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_client_manually(data: ClientCreate, current_user=Depends(require_admin)):
    return await client_service.create_client_profile(data.user_id, data)


@router.get("/{user_id}")
async def get_client(user_id: str, current_user=Depends(get_current_user)):
    role = current_user.get("role")
    if role != "ADMIN" and str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await client_service.get_client(user_id)


@router.put("/{user_id}")
async def update_client(user_id: str, data: ClientUpdate, current_user=Depends(get_current_user)):
    role = current_user.get("role")
    if role != "ADMIN" and str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await client_service.update_client(user_id, data)


@router.delete("/{user_id}")
async def deactivate_client(user_id: str, current_user=Depends(require_admin)):
    await client_service.deactivate_client(user_id)
    return {"message": "Client deactivated"}


@router.get("/{user_id}/projects")
async def get_client_projects(user_id: str, skip: int = 0, limit: int = 20, current_user=Depends(get_current_user)):
    role = current_user.get("role")
    if role != "ADMIN" and str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.repositories.project_repo import ProjectRepository
    repo = ProjectRepository()
    docs = await repo.get_by_client(user_id, skip=skip, limit=limit)
    for d in docs:
        d["id"] = str(d["_id"])
    return docs
