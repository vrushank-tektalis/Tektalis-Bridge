from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    logging.info("Connecting to MongoDB...")
    db_instance.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db_instance.db = db_instance.client[settings.MONGODB_DB_NAME]
    logging.info("Connected to MongoDB.")

async def close_mongo_connection():
    if db_instance.client:
        logging.info("Closing MongoDB connection...")
        db_instance.client.close()
        logging.info("MongoDB connection closed.")

def get_db():
    return db_instance.db
