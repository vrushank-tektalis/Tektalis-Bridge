from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    
class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class Login(BaseModel):
    email: EmailStr
    password: str

class Signup(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class RefreshToken(BaseModel):
    refresh_token: str
