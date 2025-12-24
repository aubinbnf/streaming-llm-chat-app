from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from app.models import ChatRequest
from app.services.openai_service import get_chat_response_stream
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
    try:
        for chunk in get_chat_response_stream(messages):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"
    except ValueError as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': 'Une erreur inattendue est survenue.'})}\n\n"

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/chat/stream")
def chat_stream(request: ChatRequest):
    messages = [message.model_dump() for message in request.messages]

    if not messages:
        raise HTTPException(status_code=400, detail="La liste de messages ne peut pas être vide")

    return StreamingResponse(
        event_generator(messages), 
        media_type="text/event-stream"
    )