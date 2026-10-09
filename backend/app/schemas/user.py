from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.utils.constants import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.CLIENT

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    role: UserRole
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    is_deleted: bool = False

    class Config:
        populate_by_name = True
