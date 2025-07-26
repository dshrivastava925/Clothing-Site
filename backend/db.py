import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_conversations")

class DatabaseManager:
    """Simple MongoDB manager"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self._initialized = False
    
    async def initialize(self):
        """Connect to MongoDB and create indexes"""
        if self._initialized:
            return
        
        print(f"Connecting to MongoDB: {MONGODB_URL}")
        self.client = AsyncIOMotorClient(MONGODB_URL)
        self.db = self.client[DATABASE_NAME]
        
        # Test connection
        try:
            await self.client.admin.command('ping')
            print("✅ MongoDB connected successfully")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            raise
        
        # Create indexes
        await self._create_indexes()
        self._initialized = True
    
    async def close(self):
        """Close database connection"""
        if self.client:
            print("Closing MongoDB connection")
            self.client.close()
    
    async def _create_indexes(self):
        """Create necessary indexes"""
        try:
            # Conversations indexes
            await self.db.conversations.create_index("user_id")
            await self.db.conversations.create_index("updated_at")
            
            # Messages indexes
            await self.db.messages.create_index("conversation_id")
            await self.db.messages.create_index([("conversation_id", 1), ("message_order", 1)])
            
            print("✅ Database indexes created")
            
        except Exception as e:
            print(f"❌ Failed to create indexes: {e}")
    
    def get_database(self):
        """Get database instance"""
        if not self._initialized:
            raise RuntimeError("Database not initialized")
        return self.db

# Global database manager
db_manager = DatabaseManager()

def get_database():
    """Get database instance (for dependency injection)"""
    return db_manager.get_database()