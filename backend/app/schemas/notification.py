from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.utils.constants import NotificationType


class NotificationCreate(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    message: str
    project_id: Optional[str] = None
    sender_id: Optional[str] = None


class NotificationResponse(BaseModel):
    id: str
    notification_id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    project_id: Optional[str] = None
    sender_id: Optional[str] = None
    is_read: bool
    created_at: datetime
