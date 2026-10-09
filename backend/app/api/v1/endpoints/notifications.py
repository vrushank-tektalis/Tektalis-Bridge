from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user, require_admin
from app.services.notification_service import notification_service

router = APIRouter()


@router.get("")
async def get_notifications(skip: int = 0, limit: int = 50, current_user=Depends(get_current_user)):
    return await notification_service.get_user_notifications(str(current_user["_id"]), skip=skip, limit=limit)


@router.put("/read-all")
async def mark_all_read(current_user=Depends(get_current_user)):
    await notification_service.mark_all_read(str(current_user["_id"]))
    return {"message": "All notifications marked as read"}


@router.put("/{notification_id}/read")
async def mark_read(notification_id: str, current_user=Depends(get_current_user)):
    await notification_service.mark_read(str(current_user["_id"]), notification_id)
    return {"message": "Notification marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user=Depends(get_current_user)):
    await notification_service.delete_notification(str(current_user["_id"]), notification_id)
    return {"message": "Notification deleted"}
