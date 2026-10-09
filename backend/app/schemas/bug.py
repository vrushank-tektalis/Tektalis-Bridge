from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.utils.constants import Priority, Severity, BugStatus

class BugCreate(BaseModel):
    title: str
    description: str
    severity: Severity = Severity.MEDIUM
    priority: Priority = Priority.MEDIUM

class BugUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[Severity] = None
    priority: Optional[Priority] = None
    status: Optional[BugStatus] = None
    assigned_to: Optional[str] = None

class BugResponse(BaseModel):
    id: str
    bug_id: str
    project_id: str
    title: str
    description: str
    severity: Severity
    priority: Priority
    reported_by: str
    assigned_to: Optional[str] = None
    status: BugStatus
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
