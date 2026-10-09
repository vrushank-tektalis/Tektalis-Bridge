from typing import Optional, List
from fastapi import HTTPException

from app.repositories.base import UserRepository
from app.repositories.client_repo import ClientRepository
from app.schemas.client import ClientCreate, ClientUpdate
from app.db.database import get_db


class ClientService:
    def __init__(self):
        self.repo = ClientRepository()
        self.user_repo = UserRepository()

    def _serialize(self, doc: dict) -> dict:
        doc["id"] = str(doc["_id"])
        return doc

    async def create_client_profile(self, user_id: str, data: ClientCreate) -> dict:
        existing = await self.repo.get_by_user_id(user_id)
        if existing:
            return self._serialize(existing)
        doc = {
            "user_id": user_id,
            "company_name": data.company_name,
            "phone": data.phone,
            "address": data.address,
        }
        result = await self.repo.create(doc)
        return self._serialize(result)

    async def get_client(self, user_id: str) -> dict:
        client = await self.repo.get_by_user_id(user_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        user = await self.user_repo.get_by_email_or_id(user_id)
        client["id"] = str(client["_id"])
        if user:
            client["full_name"] = user.get("full_name")
            client["email"] = user.get("email")
            client["is_active"] = user.get("is_active")
        return client

    async def list_clients(self, skip: int = 0, limit: int = 50) -> List[dict]:
        db = get_db()
        cursor = db.users.find({"role": "CLIENT", "is_deleted": False}).skip(skip).limit(limit)
        users = await cursor.to_list(length=limit)
        result = []
        for u in users:
            client = await self.repo.get_by_user_id(str(u["_id"]))
            entry = {
                "id": str(u["_id"]),
                "user_id": str(u["_id"]),
                "full_name": u.get("full_name"),
                "email": u.get("email"),
                "is_active": u.get("is_active"),
                "created_at": u.get("created_at"),
            }
            if client:
                entry.update({
                    "company_name": client.get("company_name"),
                    "phone": client.get("phone"),
                    "address": client.get("address"),
                })
            result.append(entry)
        return result

    async def update_client(self, user_id: str, data: ClientUpdate) -> dict:
        client = await self.repo.get_by_user_id(user_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await self.repo.update(str(client["_id"]), update_dict)
        return self._serialize(result)

    async def deactivate_client(self, user_id: str):
        from datetime import datetime
        db = get_db()
        await db.users.update_one(
            {"_id": __import__("bson").ObjectId(user_id)},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )


client_service = ClientService()
