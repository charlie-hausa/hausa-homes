from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
database = Database()

async def connect_to_mongo():
    """Create database connection"""
    database.client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
    print("Connected to MongoDB")

async def close_mongo_connection():
    """Close database connection"""
    if database.client:
        database.client.close()
        print("Disconnected from MongoDB")

def get_database():
    """Get database instance"""
    return database.client.hausa_erp if database.client else None