from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.utils.constants import AvailabilityStatus, DeveloperStatus

class DeveloperCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    skills: List[str] = []
    experience_years: float = 0
    designation: str
    availability: AvailabilityStatus = AvailabilityStatus.AVAILABLE

class DeveloperUpdate(BaseModel):
    phone: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[float] = None
    designation: Optional[str] = None
    availability: Optional[AvailabilityStatus] = None
    status: Optional[DeveloperStatus] = None

class DeveloperResponse(BaseModel):
    id: str
    user_id: str
    developer_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    skills: List[str] = []
    experience_years: float
    designation: str
    availability: AvailabilityStatus
    status: DeveloperStatus
    created_at: datetime
    updated_at: datetime
