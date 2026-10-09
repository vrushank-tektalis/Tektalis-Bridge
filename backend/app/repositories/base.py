from app.db.database import get_db
from bson import ObjectId
from datetime import datetime

class BaseRepository:
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        
    @property
    def collection(self):
        return get_db()[self.collection_name]

    async def get_by_id(self, id: str):
        return await self.collection.find_one({"_id": ObjectId(id), "is_deleted": False})

    async def get_all(self, skip: int = 0, limit: int = 100, query: dict = None):
        q = {"is_deleted": False}
        if query:
            q.update(query)
        cursor = self.collection.find(q).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def create(self, document: dict):
        document["created_at"] = datetime.utcnow()
        document["updated_at"] = datetime.utcnow()
        document["is_deleted"] = False
        result = await self.collection.insert_one(document)
        return await self.get_by_id(result.inserted_id)

    async def update(self, id: str, update_data: dict):
        update_data["updated_at"] = datetime.utcnow()
        await self.collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        return await self.get_by_id(id)

    async def delete(self, id: str):
        await self.collection.update_one({"_id": ObjectId(id)}, {"$set": {"is_deleted": True, "updated_at": datetime.utcnow()}})
        return True

    async def count(self, query: dict = None):
        q = {"is_deleted": False}
        if query:
            q.update(query)
        return await self.collection.count_documents(q)

class UserRepository(BaseRepository):
    def __init__(self):
        super().__init__("users")

    async def get_by_email(self, email: str):
        return await self.collection.find_one({"email": email, "is_deleted": False})

    async def get_by_email_or_id(self, user_id: str):
        """Fetch user by ObjectId string."""
        try:
            from bson import ObjectId
            return await self.collection.find_one({"_id": ObjectId(user_id), "is_deleted": False})
        except Exception:
            return None
