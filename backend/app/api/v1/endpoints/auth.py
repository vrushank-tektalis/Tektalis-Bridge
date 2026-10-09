from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.schemas.auth import Login, Signup, Token, RefreshToken
from app.services.auth_service import auth_service
from app.schemas.user import UserInDB
from app.core.dependencies import get_current_user
from app.utils.constants import UserRole
from app.core.config import settings
from app.core.security import get_password_hash
from pydantic import BaseModel

router = APIRouter()

class ForgotPassword(BaseModel):
    email: str

class ResetPassword(BaseModel):
    token: str
    new_password: str

@router.post("/signup", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def signup(data: Signup):
    user = await auth_service.create_user(data, role=UserRole.CLIENT)
    user["_id"] = str(user["_id"])
    return user

@router.post("/login", response_model=Token)
async def login(data: Login):
    user = await auth_service.authenticate_user(data)
    return await auth_service.get_tokens(user)

@router.post("/refresh", response_model=Token)
async def refresh_token(data: RefreshToken):
    try:
        payload = jwt.decode(data.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await auth_service.user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    # In a real app we'd compare the hash of data.refresh_token against the stored hashes.
    # We will issue a new pair.
    return await auth_service.get_tokens(user)

@router.post("/logout")
async def logout(data: RefreshToken, current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    # Just a placeholder for actual hash removal
    await auth_service.user_repo.update(user_id, {"refresh_tokens": []})
    return {"message": "Successfully logged out"}

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    user = await auth_service.user_repo.get_by_email(data.email)
    if not user:
        return {"message": "If email exists, a reset link was sent."}
    
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": str(user["_id"]), "type": "reset"}
    reset_token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return {"message": "If email exists, a reset link was sent.", "reset_token": reset_token}

@router.post("/reset-password")
async def reset_password(data: ResetPassword):
    try:
        payload = jwt.decode(data.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = await auth_service.user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_hash = get_password_hash(data.new_password)
    await auth_service.user_repo.update(user_id, {"hashed_password": new_hash})
    return {"message": "Password updated successfully"}

@router.get("/me", response_model=UserInDB)
async def read_users_me(current_user=Depends(get_current_user)):
    current_user["_id"] = str(current_user["_id"])
    return current_user
