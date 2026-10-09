from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.utils.constants import Priority, TaskStatus

class TaskCreate(BaseModel):
    title: str
    description: str
    priority: Priority = Priority.MEDIUM
    assigned_developer: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[TaskStatus] = None
    assigned_developer: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: str
    task_id: str
    project_id: str
    title: str
    description: str
    assigned_developer: Optional[str] = None
    priority: Priority
    status: TaskStatus
    due_date: Optional[datetime] = None
    created_by: str
    created_at: datetime
    updated_at: datetime
