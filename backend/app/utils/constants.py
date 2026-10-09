from enum import Enum

class UserRole(str, Enum):
    CLIENT = "CLIENT"
    DEVELOPER = "DEVELOPER"
    ADMIN = "ADMIN"

class AvailabilityStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    UNAVAILABLE = "UNAVAILABLE"

class DeveloperStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

class ProjectStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    ARCHIVED = "ARCHIVED"

class ProjectStage(str, Enum):
    DRAFT = "DRAFT"
    REQUIREMENT_ANALYSIS = "REQUIREMENT_ANALYSIS"
    PLANNING = "PLANNING"
    DEVELOPMENT = "DEVELOPMENT"
    CODE_REVIEW = "CODE_REVIEW"
    TESTING = "TESTING"
    BUG_FIXING = "BUG_FIXING"
    UAT = "UAT"
    DEPLOYMENT = "DEPLOYMENT"
    PRODUCTION = "PRODUCTION"
    MAINTENANCE = "MAINTENANCE"
    COMPLETED = "COMPLETED"

class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    IN_REVIEW = "IN_REVIEW"
    COMPLETED = "COMPLETED"

class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class BugStatus(str, Enum):
    OPEN = "OPEN"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    FIXED = "FIXED"
    TESTING = "TESTING"
    CLOSED = "CLOSED"
    REOPENED = "REOPENED"

class NotificationType(str, Enum):
    SYSTEM = "SYSTEM"
    PROJECT = "PROJECT"
    TASK = "TASK"
    BUG = "BUG"
    CHAT = "CHAT"

class RequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class RoomType(str, Enum):
    CLIENT_PROJECT = "CLIENT_PROJECT"
    DEVELOPER_PROJECT = "DEVELOPER_PROJECT"
    ORGANIZATION = "ORGANIZATION"
