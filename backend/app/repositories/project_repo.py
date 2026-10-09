from app.repositories.base import BaseRepository
from bson import ObjectId

class ProjectRepository(BaseRepository):
    def __init__(self):
        super().__init__("projects")
    
    async def get_by_client(self, client_id: str, skip=0, limit=100):
        cursor = self.collection.find({"client_id": client_id, "is_deleted": False}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def get_by_developer(self, developer_user_id: str, skip=0, limit=100):
        cursor = self.collection.find({"assigned_developers": developer_user_id, "is_deleted": False}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def get_by_project_id(self, project_id: str):
        return await self.collection.find_one({"project_id": project_id, "is_deleted": False})
    
    async def get_available_for_developers(self, skip=0, limit=100):
        cursor = self.collection.find({
            "status": "ACTIVE",
            "current_stage": {"$in": ["PLANNING", "DEVELOPMENT", "REQUIREMENT_ANALYSIS"]},
            "is_deleted": False
        }).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def count_by_status(self):
        pipeline = [
            {"$match": {"is_deleted": False}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        result = await self.collection.aggregate(pipeline).to_list(length=None)
        return {item["_id"]: item["count"] for item in result}
    
    async def count_by_stage(self):
        pipeline = [
            {"$match": {"is_deleted": False}},
            {"$group": {"_id": "$current_stage", "count": {"$sum": 1}}}
        ]
        result = await self.collection.aggregate(pipeline).to_list(length=None)
        return {item["_id"]: item["count"] for item in result}
