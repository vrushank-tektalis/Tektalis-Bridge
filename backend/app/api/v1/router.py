from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    clients,
    developers,
    projects,
    tasks,
    bugs,
    notifications,
    developer_requests,
    chat,
    ai,
    admin,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(clients.router, prefix="/clients", tags=["Clients"])
api_router.include_router(developers.router, prefix="/developers", tags=["Developers"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(tasks.router, prefix="", tags=["Tasks"])
api_router.include_router(bugs.router, prefix="", tags=["Bugs"])
api_router.include_router(developer_requests.router, prefix="", tags=["Developer Requests"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
