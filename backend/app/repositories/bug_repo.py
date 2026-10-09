from app.repositories.base import BaseRepository


class BugRepository(BaseRepository):
    def __init__(self):
        super().__init__("bugs")

    async def get_by_project(self, project_id: str, skip: int = 0, limit: int = 100):
        cursor = self.collection.find({"project_id": project_id, "is_deleted": False}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def count_open(self) -> int:
        return await self.collection.count_documents(
            {"status": {"$in": ["OPEN", "ASSIGNED", "IN_PROGRESS", "REOPENED"]}, "is_deleted": False}
        )
