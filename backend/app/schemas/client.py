from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClientCreate(BaseModel):
    user_id: str
    company_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientUpdate(BaseModel):
    company_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientResponse(BaseModel):
    id: str
    user_id: str
    company_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
