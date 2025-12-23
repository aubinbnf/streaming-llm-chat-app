from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from app.models import ChatRequest
from app.services.openai_service import get_chat_response, get_chat_response_stream
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def event_generator(messages: list):
    for chunk in get_chat_response_stream(messages):
        yield f"data: {json.dumps({'content': chunk})}\n\n"
    
    yield "data: [DONE]\n\n"

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/chat")
def chat(request: ChatRequest):
    messages = [message.model_dump() for message in request.messages]
    response_content = get_chat_response(messages)
    return {"response": response_content}

@app.post("/chat/stream")
def chat_stream(request: ChatRequest):
    messages = [message.model_dump() for message in request.messages]
    return StreamingResponse(
        event_generator(messages), 
        media_type="text/event-stream"
    )