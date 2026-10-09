from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from app.core.dependencies import get_current_user, require_admin
from app.services.project_service import project_service
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectStageUpdate, ProjectAssignDeveloper

router = APIRouter()


@router.get("")
async def list_projects(skip: int = 0, limit: int = 50, current_user=Depends(get_current_user)):
    return await project_service.list_projects(
        user_id=str(current_user["_id"]),
        role=current_user["role"],
        skip=skip,
        limit=limit,
    )


@router.get("/available")
async def list_available_projects(skip: int = 0, limit: int = 50, current_user=Depends(get_current_user)):
    return await project_service.get_available_projects(skip=skip, limit=limit)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_project(data: ProjectCreate, current_user=Depends(get_current_user)):
    if current_user["role"] not in ["CLIENT", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only clients and admins can create projects")
    return await project_service.create_project(str(current_user["_id"]), data)


@router.get("/{project_id}")
async def get_project(project_id: str, current_user=Depends(get_current_user)):
    return await project_service.get_project(project_id, str(current_user["_id"]), current_user["role"])


@router.put("/{project_id}")
async def update_project(project_id: str, data: ProjectUpdate, current_user=Depends(require_admin)):
    return await project_service.update_project(project_id, data, str(current_user["_id"]))


@router.delete("/{project_id}")
async def delete_project(project_id: str, current_user=Depends(require_admin)):
    await project_service.soft_delete_project(project_id)
    return {"message": "Project archived"}


@router.put("/{project_id}/stage")
async def change_stage(project_id: str, data: ProjectStageUpdate, current_user=Depends(require_admin)):
    return await project_service.change_stage(project_id, data, str(current_user["_id"]))


@router.post("/{project_id}/assign-developer")
async def assign_developer(project_id: str, data: ProjectAssignDeveloper, current_user=Depends(require_admin)):
    return await project_service.assign_developer(project_id, data.developer_user_id, str(current_user["_id"]))


@router.delete("/{project_id}/developers/{developer_user_id}")
async def remove_developer(project_id: str, developer_user_id: str, current_user=Depends(require_admin)):
    return await project_service.remove_developer(project_id, developer_user_id, str(current_user["_id"]))


@router.get("/{project_id}/activity")
async def get_project_activity(project_id: str, skip: int = 0, limit: int = 50, current_user=Depends(get_current_user)):
    # Verify project access
    await project_service.get_project(project_id, str(current_user["_id"]), current_user["role"])
    from app.services.activity_log_service import activity_log_service
    return await activity_log_service.get_project_activity(project_id, skip=skip, limit=limit)


@router.put("/{project_id}/requirements")
async def set_requirements(project_id: str, data: dict, current_user=Depends(get_current_user)):
    if current_user["role"] not in ["CLIENT", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await project_service.set_requirements(project_id, data, str(current_user["_id"]), current_user["role"])
