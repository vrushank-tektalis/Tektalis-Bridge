from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from app.core.config import settings
from app.db.database import connect_to_mongo, close_mongo_connection, get_db
import uvicorn
import logging

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1.router import api_router
from app.websockets.chat_ws import router as ws_router
# from app.websockets.notification_ws import router as notif_ws_router

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    db = get_db()
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.projects.create_index("project_id", unique=True)
    await db.developers.create_index("developer_id", unique=True)
    await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
    await db.messages.create_index([("room_id", 1), ("created_at", 1)])
    await db.activity_logs.create_index([("project_id", 1), ("created_at", -1)])
    
    # Create first admin if not exists
    existing_admin = await db.users.find_one({"role": "ADMIN", "is_deleted": False})
    if not existing_admin:
        from app.core.security import get_password_hash
        from datetime import datetime
        admin_doc = {
            "email": settings.FIRST_ADMIN_EMAIL,
            "hashed_password": get_password_hash(settings.FIRST_ADMIN_PASSWORD),
            "full_name": settings.FIRST_ADMIN_NAME,
            "role": "ADMIN",
            "is_active": True,
            "is_deleted": False,
            "refresh_tokens": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.users.insert_one(admin_doc)
        print(f"First admin created: {settings.FIRST_ADMIN_EMAIL}")
    
    # Create organization chat room if not exists
    existing_org_room = await db.chat_rooms.find_one({"room_type": "ORGANIZATION"})
    if not existing_org_room:
        from datetime import datetime
        await db.chat_rooms.insert_one({
            "room_id": "org-chat-main",
            "project_id": None,
            "room_type": "ORGANIZATION",
            "members": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(api_router, prefix="/api/v1")
app.include_router(ws_router)
# app.include_router(notif_ws_router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
