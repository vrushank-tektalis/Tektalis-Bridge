from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MessageCreate(BaseModel):
    content: str
    message_type: str = "text"


class MessageResponse(BaseModel):
    id: str
    message_id: str
    room_id: str
    sender_id: str
    sender_name: str
    content: str
    message_type: str
    is_read_by: List[str] = []
    created_at: datetime
