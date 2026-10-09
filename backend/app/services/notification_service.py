import uuid
from datetime import datetime
from typing import Optional
from fastapi import HTTPException

from app.repositories.notification_repo import NotificationRepository
from app.utils.constants import NotificationType


class NotificationService:
    def __init__(self):
        self.repo = NotificationRepository()

    async def create_notification(
        self,
        user_id: str,
        type: NotificationType,
        title: str,
        message: str,
        project_id: Optional[str] = None,
        sender_id: Optional[str] = None,
    ) -> dict:
        """Create a notification and attempt real-time delivery via WebSocket."""
        doc = {
            "notification_id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": type,
            "title": title,
            "message": message,
            "project_id": project_id,
            "sender_id": sender_id,
            "is_read": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_deleted": False,
        }
        result = await self.repo.collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc["_id"] = result.inserted_id

        # Attempt real-time push (imported late to avoid circular imports)
        try:
            from app.websockets.manager import connection_manager
            import json
            payload = {
                "type": "notification",
                "data": {
                    "notification_id": doc["notification_id"],
                    "type": type,
                    "title": title,
                    "message": message,
                    "project_id": project_id,
                    "is_read": False,
                    "created_at": doc["created_at"].isoformat(),
                },
            }
            await connection_manager.send_to_user(user_id, json.dumps(payload))
        except Exception:
            pass  # WS push is best-effort

        return doc

    async def get_user_notifications(self, user_id: str, skip: int = 0, limit: int = 50):
        docs = await self.repo.get_by_user(user_id, skip=skip, limit=limit)
        for d in docs:
            d["id"] = str(d["_id"])
        return docs

    async def count_unread(self, user_id: str) -> int:
        return await self.repo.count_unread(user_id)

    async def mark_read(self, user_id: str, notification_id: str):
        await self.repo.mark_read(notification_id)

    async def mark_all_read(self, user_id: str):
        await self.repo.mark_all_read(user_id)

    async def delete_notification(self, user_id: str, notification_id: str):
        await self.repo.delete_notification(notification_id, user_id)


notification_service = NotificationService()
