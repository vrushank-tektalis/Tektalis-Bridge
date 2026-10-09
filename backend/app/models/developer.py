from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.utils.constants import AvailabilityStatus, DeveloperStatus

class DeveloperModel(BaseModel):
    user_id: str
    developer_id: str  # DEV-001
    phone: Optional[str] = None
    skills: List[str] = []
    experience_years: float = 0
    designation: str
    availability: AvailabilityStatus = AvailabilityStatus.AVAILABLE
    status: DeveloperStatus = DeveloperStatus.ACTIVE
    created_by: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False
