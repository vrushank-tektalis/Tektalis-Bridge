from app.repositories.base import BaseRepository


class ActivityLogRepository(BaseRepository):
    def __init__(self):
        super().__init__("activity_logs")

    async def get_by_project(self, project_id: str, skip: int = 0, limit: int = 50):
        cursor = self.collection.find(
            {"project_id": project_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def create_log(self, project_id, actor_id: str, action: str, description: str, metadata: dict = None):
        from datetime import datetime
        import uuid
        doc = {
            "log_id": str(uuid.uuid4()),
            "project_id": project_id,
            "actor_id": actor_id,
            "action": action,
            "description": description,
            "metadata": metadata or {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_deleted": False
        }
        await self.collection.insert_one(doc)
        return doc
