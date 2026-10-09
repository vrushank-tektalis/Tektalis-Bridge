from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository):
    def __init__(self):
        super().__init__("notifications")

    async def get_by_user(self, user_id: str, skip: int = 0, limit: int = 50):
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def count_unread(self, user_id: str) -> int:
        return await self.collection.count_documents({"user_id": user_id, "is_read": False})

    async def mark_read(self, notification_id: str):
        from datetime import datetime
        await self.collection.update_one(
            {"notification_id": notification_id},
            {"$set": {"is_read": True, "updated_at": datetime.utcnow()}}
        )

    async def mark_all_read(self, user_id: str):
        from datetime import datetime
        await self.collection.update_many(
            {"user_id": user_id, "is_read": False},
            {"$set": {"is_read": True, "updated_at": datetime.utcnow()}}
        )

    async def delete_notification(self, notification_id: str, user_id: str):
        await self.collection.delete_one({"notification_id": notification_id, "user_id": user_id})
