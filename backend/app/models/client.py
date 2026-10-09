from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClientModel(BaseModel):
    user_id: str
    company_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False
