from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.core.security import verify_password
from app.db.database import get_db
from bson import ObjectId
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user

def require_role(roles: list[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

require_client = require_role(["CLIENT"])
require_developer = require_role(["DEVELOPER"])
require_admin = require_role(["ADMIN"])
require_admin_or_developer = require_role(["ADMIN", "DEVELOPER"])
require_authenticated = get_current_user
