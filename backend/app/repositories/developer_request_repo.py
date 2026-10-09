from app.repositories.base import BaseRepository


class DeveloperRequestRepository(BaseRepository):
    def __init__(self):
        super().__init__("developer_requests")

    async def get_by_developer(self, developer_user_id: str, skip: int = 0, limit: int = 50):
        cursor = self.collection.find(
            {"developer_id": developer_user_id, "is_deleted": False}
        ).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_by_project(self, project_id: str, skip: int = 0, limit: int = 50):
        cursor = self.collection.find(
            {"project_id": project_id, "is_deleted": False}
        ).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_by_request_id(self, request_id: str):
        return await self.collection.find_one({"request_id": request_id, "is_deleted": False})

    async def count_pending(self) -> int:
        return await self.collection.count_documents({"status": "PENDING", "is_deleted": False})

    async def find_existing(self, project_id: str, developer_id: str):
        return await self.collection.find_one({
            "project_id": project_id,
            "developer_id": developer_id,
            "status": "PENDING",
            "is_deleted": False
        })
