from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from app.utils.constants import UserRole
from bson import ObjectId

class UserModel(BaseModel):
    email: str
    hashed_password: str
    role: UserRole
    full_name: str
    is_active: bool = True
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    refresh_tokens: List[str] = []

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
