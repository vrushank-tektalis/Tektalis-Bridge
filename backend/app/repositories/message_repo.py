from app.repositories.base import BaseRepository


class MessageRepository(BaseRepository):
    def __init__(self):
        super().__init__("messages")

    async def get_by_room(self, room_id: str, skip: int = 0, limit: int = 50):
        cursor = self.collection.find(
            {"room_id": room_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return list(reversed(docs))  # Return chronological order

    async def get_room_for_user(self, user_id: str):
        from app.db.database import get_db
        db = get_db()
        cursor = db.chat_rooms.find({"members": user_id})
        return await cursor.to_list(length=100)

    async def mark_read(self, message_id: str, user_id: str):
        await self.collection.update_one(
            {"message_id": message_id},
            {"$addToSet": {"is_read_by": user_id}}
        )
