from app.repositories.base import BaseRepository

class TaskRepository(BaseRepository):
    def __init__(self):
        super().__init__("tasks")
    
    async def get_by_project(self, project_id: str, skip=0, limit=100):
        cursor = self.collection.find({"project_id": project_id, "is_deleted": False}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def get_by_developer(self, developer_user_id: str, skip=0, limit=100):
        cursor = self.collection.find({"assigned_developer": developer_user_id, "is_deleted": False, "status": {"$ne": "COMPLETED"}}).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def count_by_project(self, project_id: str):
        return await self.collection.count_documents({"project_id": project_id, "is_deleted": False})
