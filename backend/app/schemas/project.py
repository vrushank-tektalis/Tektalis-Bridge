from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.utils.constants import ProjectStatus, ProjectStage

class ProjectCreate(BaseModel):
    title: str
    description: str
    expected_completion_date: Optional[datetime] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    expected_completion_date: Optional[datetime] = None
    progress_percentage: Optional[float] = None

class ProjectStageUpdate(BaseModel):
    stage: ProjectStage
    progress_percentage: Optional[float] = None
    notes: Optional[str] = None

class ProjectAssignDeveloper(BaseModel):
    developer_user_id: str

class ProjectResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: str
    client_id: str
    status: ProjectStatus
    current_stage: ProjectStage
    progress_percentage: float
    start_date: Optional[datetime] = None
    expected_completion_date: Optional[datetime] = None
    actual_completion_date: Optional[datetime] = None
    assigned_developers: List[str] = []
    created_at: datetime
    updated_at: datetime

class ProjectWithRequirements(ProjectResponse):
    requirements: Optional[Dict[str, Any]] = None
