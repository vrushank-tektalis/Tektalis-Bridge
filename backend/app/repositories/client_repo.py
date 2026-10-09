from app.repositories.base import BaseRepository

class ClientRepository(BaseRepository):
    def __init__(self):
        super().__init__("clients")
    
    async def get_by_user_id(self, user_id: str):
        return await self.collection.find_one({"user_id": user_id, "is_deleted": False})
