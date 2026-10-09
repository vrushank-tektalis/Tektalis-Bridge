from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.utils.constants import RequestStatus


class DeveloperRequestCreate(BaseModel):
    message: Optional[str] = None


class DeveloperRequestUpdate(BaseModel):
    status: RequestStatus
    notes: Optional[str] = None


class DeveloperRequestResponse(BaseModel):
    id: str
    request_id: str
    project_id: str
    developer_id: str
    requested_by: Optional[str] = None
    status: RequestStatus
    message: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
