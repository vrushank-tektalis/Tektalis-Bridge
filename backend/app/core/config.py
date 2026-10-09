import os
from pydantic_settings import BaseSettings
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tektalis Bridge"
    VERSION: str = "1.0.0"
    
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "tektalis_bridge")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    FIRST_ADMIN_EMAIL: str = os.getenv("FIRST_ADMIN_EMAIL", "admin@tektalis.com")
    FIRST_ADMIN_PASSWORD: str = os.getenv("FIRST_ADMIN_PASSWORD", "Admin@123456")
    FIRST_ADMIN_NAME: str = os.getenv("FIRST_ADMIN_NAME", "System Admin")
    
    AI_API_URL: str = os.getenv("AI_API_URL", "https://generativelanguage.googleapis.com/v1beta")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-2.0-flash")
    
    RATE_LIMIT: str = os.getenv("RATE_LIMIT", "100/minute")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "your-encryption-key")

settings = Settings()
