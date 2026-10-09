from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.core.security import verify_password, get_password_hash
from app.db.database import get_db
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


router = APIRouter()


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    user = dict(current_user)
    user["id"] = str(user["_id"])
    del user["_id"]
    user.pop("hashed_password", None)
    user.pop("refresh_tokens", None)
    return user


@router.put("/me")
async def update_me(data: ProfileUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_dict})
    user = await db.users.find_one({"_id": current_user["_id"]})
    user["id"] = str(user["_id"])
    del user["_id"]
    user.pop("hashed_password", None)
    user.pop("refresh_tokens", None)
    return user


@router.put("/me/password")
async def change_password(data: PasswordChange, current_user=Depends(get_current_user)):
    if not verify_password(data.old_password, current_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    db = get_db()
    new_hash = get_password_hash(data.new_password)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"hashed_password": new_hash, "updated_at": datetime.utcnow()}}
    )
    return {"message": "Password changed successfully"}
