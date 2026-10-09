from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user, require_admin
from app.services.developer_request_service import developer_request_service
from app.schemas.developer_request import DeveloperRequestCreate, DeveloperRequestUpdate

router = APIRouter()


@router.post("/projects/{project_id}/developer-requests", status_code=status.HTTP_201_CREATED)
async def create_request(
    project_id: str,
    data: DeveloperRequestCreate,
    current_user=Depends(get_current_user),
):
    if current_user["role"] not in ["DEVELOPER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only developers can request to join projects")
    return await developer_request_service.create_request(
        project_id=project_id,
        developer_user_id=str(current_user["_id"]),
        data=data,
    )


@router.get("/developer-requests")
async def list_requests(skip: int = 0, limit: int = 50, current_user=Depends(get_current_user)):
    if current_user["role"] not in ["DEVELOPER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await developer_request_service.list_requests(
        str(current_user["_id"]), current_user["role"], skip=skip, limit=limit
    )


@router.get("/developer-requests/{request_id}")
async def get_request(request_id: str, current_user=Depends(get_current_user)):
    return await developer_request_service.get_request(request_id, str(current_user["_id"]), current_user["role"])


@router.put("/developer-requests/{request_id}")
async def update_request(request_id: str, data: DeveloperRequestUpdate, current_user=Depends(get_current_user)):
    if current_user["role"] == "ADMIN":
        return await developer_request_service.review_request(request_id, data, str(current_user["_id"]))
    elif current_user["role"] == "DEVELOPER":
        if data.status != "CANCELLED":
            raise HTTPException(status_code=403, detail="Developers can only cancel their own requests")
        return await developer_request_service.cancel_request(request_id, str(current_user["_id"]))
    raise HTTPException(status_code=403, detail="Not authorized")
