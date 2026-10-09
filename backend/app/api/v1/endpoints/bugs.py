from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user, require_admin
from app.services.bug_service import bug_service
from app.schemas.bug import BugCreate, BugUpdate

router = APIRouter()


@router.get("/projects/{project_id}/bugs")
async def list_bugs(project_id: str, skip: int = 0, limit: int = 100, current_user=Depends(get_current_user)):
    return await bug_service.list_bugs(
        project_id=project_id,
        user_id=str(current_user["_id"]),
        role=current_user["role"],
        skip=skip,
        limit=limit,
    )


@router.post("/projects/{project_id}/bugs", status_code=status.HTTP_201_CREATED)
async def create_bug(project_id: str, data: BugCreate, current_user=Depends(get_current_user)):
    return await bug_service.create_bug(
        project_id=project_id,
        data=data,
        reporter_user_id=str(current_user["_id"]),
        role=current_user["role"],
    )


@router.get("/bugs/{bug_id}")
async def get_bug(bug_id: str, current_user=Depends(get_current_user)):
    return await bug_service.get_bug(bug_id, str(current_user["_id"]), current_user["role"])


@router.put("/bugs/{bug_id}")
async def update_bug(bug_id: str, data: BugUpdate, current_user=Depends(get_current_user)):
    return await bug_service.update_bug(bug_id, data, str(current_user["_id"]), current_user["role"])


@router.delete("/bugs/{bug_id}")
async def delete_bug(bug_id: str, current_user=Depends(require_admin)):
    await bug_service.delete_bug(bug_id, str(current_user["_id"]), current_user["role"])
    return {"message": "Bug deleted"}
