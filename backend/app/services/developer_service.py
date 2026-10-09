from typing import Optional, List
from fastapi import HTTPException

from app.repositories.developer_repo import DeveloperRepository
from app.repositories.base import UserRepository
from app.schemas.developer import DeveloperCreate, DeveloperUpdate
from app.core.security import get_password_hash
from app.utils.id_generator import generate_id
from app.db.database import get_db
from datetime import datetime


class DeveloperService:
    def __init__(self):
        self.repo = DeveloperRepository()
        self.user_repo = UserRepository()

    def _serialize(self, doc: dict) -> dict:
        doc["id"] = str(doc["_id"])
        return doc

    async def create_developer(self, data: DeveloperCreate, admin_user_id: str) -> dict:
        # Check email uniqueness
        existing_user = await self.user_repo.get_by_email(data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        developer_id = await generate_id("DEV")

        # Create user account
        db = get_db()
        user_doc = {
            "email": data.email,
            "hashed_password": get_password_hash(data.password),
            "full_name": data.full_name,
            "role": "DEVELOPER",
            "is_active": True,
            "is_deleted": False,
            "refresh_tokens": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        user_result = await db.users.insert_one(user_doc)
        user_id = str(user_result.inserted_id)

        # Create developer profile
        dev_doc = {
            "user_id": user_id,
            "developer_id": developer_id,
            "phone": data.phone,
            "skills": data.skills,
            "experience_years": data.experience_years,
            "designation": data.designation,
            "availability": data.availability,
            "status": "ACTIVE",
            "created_by": admin_user_id,
        }
        result = await self.repo.create(dev_doc)
        merged = self._serialize(result)
        merged["full_name"] = data.full_name
        merged["email"] = data.email
        return merged

    async def list_developers(self, skip: int = 0, limit: int = 50, availability: Optional[str] = None) -> List[dict]:
        db = get_db()
        query: dict = {"role": "DEVELOPER", "is_deleted": False, "is_active": True}
        users = await db.users.find(query).skip(skip).limit(limit).to_list(length=limit)
        result = []
        for u in users:
            dev = await self.repo.get_by_user_id(str(u["_id"]))
            if dev:
                if availability and dev.get("availability") != availability:
                    continue
                entry = self._serialize(dev)
                entry["full_name"] = u.get("full_name")
                entry["email"] = u.get("email")
                entry["is_active"] = u.get("is_active")
                result.append(entry)
        return result

    async def get_developer(self, user_id: str) -> dict:
        dev = await self.repo.get_by_user_id(user_id)
        if not dev:
            raise HTTPException(status_code=404, detail="Developer not found")
        db = get_db()
        from bson import ObjectId
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        entry = self._serialize(dev)
        if user:
            entry["full_name"] = user.get("full_name")
            entry["email"] = user.get("email")
            entry["is_active"] = user.get("is_active")
        return entry

    async def get_developer_by_id_code(self, developer_id: str) -> dict:
        dev = await self.repo.get_by_developer_id(developer_id)
        if not dev:
            raise HTTPException(status_code=404, detail="Developer not found")
        return await self.get_developer(dev["user_id"])

    async def update_developer(self, user_id: str, data: DeveloperUpdate) -> dict:
        dev = await self.repo.get_by_user_id(user_id)
        if not dev:
            raise HTTPException(status_code=404, detail="Developer not found")
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await self.repo.update(str(dev["_id"]), update_dict)
        return self._serialize(result)

    async def deactivate_developer(self, user_id: str):
        db = get_db()
        from bson import ObjectId
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
        dev = await self.repo.get_by_user_id(user_id)
        if dev:
            await self.repo.update(str(dev["_id"]), {"status": "INACTIVE"})

    async def get_available_developers(self) -> List[dict]:
        devs = await self.repo.get_available()
        result = []
        db = get_db()
        from bson import ObjectId
        for dev in devs:
            user = await db.users.find_one({"_id": ObjectId(dev["user_id"])})
            entry = self._serialize(dev)
            if user:
                entry["full_name"] = user.get("full_name")
                entry["email"] = user.get("email")
            result.append(entry)
        return result


developer_service = DeveloperService()
