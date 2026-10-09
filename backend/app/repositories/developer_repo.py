from app.repositories.base import BaseRepository

class DeveloperRepository(BaseRepository):
    def __init__(self):
        super().__init__("developers")
    
    async def get_by_user_id(self, user_id: str):
        return await self.collection.find_one({"user_id": user_id, "is_deleted": False})
    
    async def get_by_developer_id(self, developer_id: str):
        return await self.collection.find_one({"developer_id": developer_id, "is_deleted": False})
    
    async def get_available(self, skip=0, limit=100):
        cursor = self.collection.find({"availability": "AVAILABLE", "status": "ACTIVE", "is_deleted": False}).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
