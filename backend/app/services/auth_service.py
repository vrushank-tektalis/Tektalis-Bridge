from app.repositories.base import UserRepository
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.schemas.auth import Login, Signup, Token
from app.utils.constants import UserRole
from fastapi import HTTPException, status
from datetime import datetime

class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

    async def authenticate_user(self, data: Login):
        user = await self.user_repo.get_by_email(data.email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not verify_password(data.password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not user.get("is_active"):
            raise HTTPException(status_code=400, detail="User is inactive")
        
        # update last login
        await self.user_repo.update(str(user["_id"]), {"last_login": datetime.utcnow()})
        return user

    async def create_user(self, data: Signup, role: UserRole = UserRole.CLIENT):
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_dict = {
            "email": data.email,
            "hashed_password": get_password_hash(data.password),
            "full_name": data.full_name,
            "role": role,
            "is_active": True,
            "refresh_tokens": []
        }
        return await self.user_repo.create(user_dict)

    async def get_tokens(self, user):
        access_token = create_access_token(subject=str(user["_id"]), role=user["role"])
        refresh_token = create_refresh_token(subject=str(user["_id"]))
        
        # save hash of refresh token in db (simplified for now by storing it directly, 
        # instructions say store hashed but to save time we will just store raw or hashed)
        tokens = user.get("refresh_tokens", [])
        tokens.append(get_password_hash(refresh_token))
        if len(tokens) > 5:
            tokens.pop(0)
        await self.user_repo.update(str(user["_id"]), {"refresh_tokens": tokens})
        
        return Token(access_token=access_token, refresh_token=refresh_token)

auth_service = AuthService()
