import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import HTTPException

from app.repositories.message_repo import MessageRepository
from app.db.database import get_db


class ChatService:
    def __init__(self):
        self.msg_repo = MessageRepository()

    async def get_or_create_room(self, project_id: Optional[str], room_type: str, members: List[str]) -> dict:
        db = get_db()
        query = {"room_type": room_type}
        if project_id:
            query["project_id"] = project_id
        room = await db.chat_rooms.find_one(query)
        if not room:
            room_doc = {
                "room_id": str(uuid.uuid4()),
                "project_id": project_id,
                "room_type": room_type,
                "members": members,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            result = await db.chat_rooms.insert_one(room_doc)
            room_doc["id"] = str(result.inserted_id)
            return room_doc
        room["id"] = str(room["_id"])
        return room

    async def add_member_to_room(self, room_id: str, user_id: str):
        db = get_db()
        await db.chat_rooms.update_one(
            {"room_id": room_id},
            {"$addToSet": {"members": user_id}, "$set": {"updated_at": datetime.utcnow()}}
        )

    async def get_user_rooms(self, user_id: str) -> List[dict]:
        db = get_db()
        cursor = db.chat_rooms.find({"members": user_id})
        rooms = await cursor.to_list(length=100)
        for r in rooms:
            r["id"] = str(r["_id"])
        return rooms

    async def get_room(self, room_id: str) -> Optional[dict]:
        db = get_db()
        room = await db.chat_rooms.find_one({"room_id": room_id})
        if room:
            room["id"] = str(room["_id"])
        return room

    async def get_room_messages(self, room_id: str, user_id: str, skip: int = 0, limit: int = 50) -> List[dict]:
        # Verify user is member
        db = get_db()
        room = await db.chat_rooms.find_one({"room_id": room_id, "members": user_id})
        if not room:
            raise HTTPException(status_code=403, detail="You are not a member of this chat room")
        msgs = await self.msg_repo.get_by_room(room_id, skip=skip, limit=limit)
        for m in msgs:
            m["id"] = str(m["_id"])
        return msgs

    async def send_message(self, room_id: str, sender_id: str, sender_name: str, content: str, message_type: str = "text") -> dict:
        msg_doc = {
            "message_id": str(uuid.uuid4()),
            "room_id": room_id,
            "sender_id": sender_id,
            "sender_name": sender_name,
            "content": content,
            "message_type": message_type,
            "is_read_by": [sender_id],
        }
        result = await self.msg_repo.create(msg_doc)
        result["id"] = str(result["_id"])
        return result

    async def get_org_chat_room(self) -> Optional[dict]:
        db = get_db()
        room = await db.chat_rooms.find_one({"room_type": "ORGANIZATION"})
        if room:
            room["id"] = str(room["_id"])
        return room


chat_service = ChatService()
