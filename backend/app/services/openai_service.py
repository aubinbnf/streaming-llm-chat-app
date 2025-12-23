import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_chat_response(messages: list) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=False
    )
    return response.choices[0].message.content

def get_chat_response_stream(messages: list):
    stream = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=True
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content