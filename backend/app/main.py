from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from app.models import ChatRequest, StreamChatRequest
from app.services.openai_service import get_chat_response_stream
import json
from uuid import uuid4
import os
from dotenv import load_dotenv

load_dotenv()

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173")
SYSTEM_PROMPT = os.getenv("SYSTEM_PROMPT", "Tu es un assistant IA serviable et concis.")

sessions: dict[str, list[dict]] = {}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def event_generator(session_id: str, messages: list):
    accumulated_response = ""

    try:
        for chunk in get_chat_response_stream(messages):
            accumulated_response += chunk
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"

        sessions[session_id].append({
            "role": "assistant",
            "content": accumulated_response
        })

    except ValueError as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': 'Une erreur inattendue est survenue.'})}\n\n"

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/chat/session")
def create_session():
    session_id = str(uuid4())
    sessions[session_id] = []
    return {"session_id": session_id}

@app.get("/chat/session/{session_id}")
def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session non trouvée")
    return {"messages": sessions[session_id]}

@app.post("/chat/stream")
def chat_stream(request: StreamChatRequest):
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session non trouvée")

    history = sessions[request.session_id]

    user_message = request.message.model_dump()
    history.append(user_message)

    system_message = {"role": "system", "content": SYSTEM_PROMPT}

    all_messages = [system_message] + history

    if not history:
        raise HTTPException(status_code=400, detail="La liste de messages ne peut pas être vide")

    return StreamingResponse(
        event_generator(request.session_id, all_messages), 
        media_type="text/event-stream"
    )