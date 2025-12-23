from fastapi import FastAPI
from app.models import ChatRequest
from app.services.openai_service import get_chat_response

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/chat")
def chat(request: ChatRequest):
    messages = [message.model_dump() for message in request.messages]
    response_content = get_chat_response(messages)
    return {"response": response_content}