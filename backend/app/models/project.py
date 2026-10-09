from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class ProjectModel(BaseModel):
    project_id: str
    title: str
    description: str
    client_id: str
    status: str
    current_stage: str
    progress_percentage: float = 0.0
    start_date: Optional[datetime] = None
    expected_completion_date: Optional[datetime] = None
    actual_completion_date: Optional[datetime] = None
    assigned_developers: list[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
