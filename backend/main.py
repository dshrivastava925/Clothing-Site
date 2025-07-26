import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()  # take environment variables


from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from groq import Groq

from db import db_manager, get_database

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "gemma2-9b-it")

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Pydantic Models
class MessageCreate(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ConversationCreate(BaseModel):
    user_id: str
    title: str = "New Conversation"

class ChatRequest(BaseModel):
    message: str
    user_id: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

# FastAPI App
app = FastAPI(title="Simple AI Chat Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db_manager.initialize()

@app.on_event("shutdown")
async def shutdown():
    await db_manager.close()

# Routes
@app.get("/")
async def root():
    return {"message": "Simple AI Chat Backend"}

@app.get("/health")
async def health():
    db = get_database()
    try:
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except:
        return {"status": "unhealthy", "database": "disconnected"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Main chat endpoint"""
    db = get_database()
    
    # Get or create conversation
    if request.conversation_id:
        conversation_id = ObjectId(request.conversation_id)
        conversation = await db.conversations.find_one({"_id": conversation_id})
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        # Create new conversation
        conversation_doc = {
            "user_id": request.user_id,
            "title": "New Chat",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await db.conversations.insert_one(conversation_doc)
        conversation_id = result.inserted_id
    
    # Add user message
    user_message = {
        "conversation_id": conversation_id,
        "role": "user",
        "content": request.message,
        "created_at": datetime.utcnow(),
        "message_order": await get_next_message_order(db, conversation_id)
    }
    await db.messages.insert_one(user_message)
    
    # Get conversation history for context
    messages = await db.messages.find(
        {"conversation_id": conversation_id}
    ).sort("message_order", 1).to_list(50)
    
    # Format for Groq API
    chat_messages = [{"role": msg["role"], "content": msg["content"]} for msg in messages]
    
    # Get AI response
    if groq_client:
        try:
            completion = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=chat_messages,
                temperature=0.7,
                max_tokens=2048
            )
            ai_response = completion.choices[0].message.content
        except Exception as e:
            ai_response = f"Sorry, I encountered an error: {str(e)}"
    else:
        ai_response = "AI service not configured. Please set GROQ_API_KEY."
    
    # Add AI response to database
    ai_message = {
        "conversation_id": conversation_id,
        "role": "assistant",
        "content": ai_response,
        "created_at": datetime.utcnow(),
        "message_order": await get_next_message_order(db, conversation_id)
    }
    await db.messages.insert_one(ai_message)
    
    # Update conversation timestamp
    await db.conversations.update_one(
        {"_id": conversation_id},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    
    return ChatResponse(response=ai_response, conversation_id=str(conversation_id))

@app.post("/conversations")
async def create_conversation(conversation: ConversationCreate):
    """Create a new conversation"""
    db = get_database()
    
    conversation_doc = {
        "user_id": conversation.user_id,
        "title": conversation.title,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.conversations.insert_one(conversation_doc)
    return {"conversation_id": str(result.inserted_id)}

@app.get("/conversations/{user_id}")
async def get_user_conversations(user_id: str):
    """Get all conversations for a user"""
    db = get_database()
    
    conversations = await db.conversations.find(
        {"user_id": user_id}
    ).sort("updated_at", -1).to_list(50)
    
    # Convert ObjectId to string
    for conv in conversations:
        conv["_id"] = str(conv["_id"])
    
    return conversations

@app.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str):
    """Get all messages in a conversation"""
    db = get_database()
    
    messages = await db.messages.find(
        {"conversation_id": ObjectId(conversation_id)}
    ).sort("message_order", 1).to_list(None)
    
    # Convert ObjectId to string
    for msg in messages:
        msg["_id"] = str(msg["_id"])
        msg["conversation_id"] = str(msg["conversation_id"])
    
    return messages

@app.post("/data/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Upload and process CSV data"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV")
    
    db = get_database()
    content = await file.read()
    
    try:
        # Read CSV
        df = pd.read_csv(pd.StringIO(content.decode('utf-8')))
        
        # Validate columns
        required_cols = ['user_id', 'role', 'content']
        if not all(col in df.columns for col in required_cols):
            raise HTTPException(status_code=400, detail=f"CSV must have columns: {required_cols}")
        
        processed = 0
        conversations_created = 0
        
        # Group by user_id and create conversations
        for user_id, group in df.groupby('user_id'):
            # Create conversation
            conversation_doc = {
                "user_id": str(user_id),
                "title": f"Imported Chat - {file.filename}",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await db.conversations.insert_one(conversation_doc)
            conversation_id = result.inserted_id
            conversations_created += 1
            
            # Add messages
            messages = []
            for idx, row in group.iterrows():
                message_doc = {
                    "conversation_id": conversation_id,
                    "role": str(row['role']),
                    "content": str(row['content']),
                    "created_at": datetime.utcnow(),
                    "message_order": len(messages) + 1
                }
                messages.append(message_doc)
                processed += 1
            
            if messages:
                await db.messages.insert_many(messages)
        
        return {
            "message": "CSV processed successfully",
            "records_processed": processed,
            "conversations_created": conversations_created
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")

# Helper functions
async def get_next_message_order(db, conversation_id: ObjectId) -> int:
    """Get the next message order number"""
    last_message = await db.messages.find_one(
        {"conversation_id": conversation_id},
        sort=[("message_order", -1)]
    )
    return (last_message["message_order"] + 1) if last_message else 1

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)