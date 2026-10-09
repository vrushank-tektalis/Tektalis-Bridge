from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class AIAnalyzeRequest(BaseModel):
    description: str


class AIRequirementsOutput(BaseModel):
    title: str
    description: str
    project_type: str
    business_domain: str
    functional_requirements: List[str] = []
    frontend_technologies: List[str] = []
    backend_technologies: List[str] = []
    database: List[str] = []
    middleware: List[str] = []
    apis: List[str] = []
    third_party_services: List[str] = []
    authentication: List[str] = []
    authorization: List[str] = []
    security: List[str] = []
    performance_requirements: List[str] = []
    scalability_requirements: List[str] = []
    deployment_requirements: List[str] = []
    recommended_features: List[str] = []
    estimated_complexity: str  # LOW, MEDIUM, HIGH, VERY_HIGH
    assumptions: List[str] = []
    questions_for_client: List[str] = []


class AIAnalyzeResponse(BaseModel):
    request_id: str
    status: str
    requirements: Optional[AIRequirementsOutput] = None
    error: Optional[str] = None
