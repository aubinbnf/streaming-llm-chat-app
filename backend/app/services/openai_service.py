import os
from openai import OpenAI, BadRequestError, AuthenticationError, RateLimitError, APITimeoutError
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

def get_chat_response(messages: list) -> str:
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            stream=False
        )
        return response.choices[0].message.content
    except AuthenticationError as e:
        raise ValueError("Erreur d'authentification OpenAI. Vérifiez votre clé API.") from e
    except RateLimitError as e:
        raise ValueError("Limite de taux OpenAI atteinte. Veuillez réessayer plus tard.") from e
    except BadRequestError as e:
        raise ValueError("Requête invalide envoyée à l'API OpenAI.") from e
    except APITimeoutError as e:
        raise ValueError("Délai d'attente de l'API OpenAI dépassé.") from e
    except Exception as e:
        raise ValueError(f"Erreur inattendue : {str(e)}") from e

def get_chat_response_stream(messages: list):
    try:
        stream = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            stream=True
        )
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content
    except AuthenticationError as e:
        raise ValueError("Erreur d'authentification OpenAI. Vérifiez votre clé API.") from e
    except RateLimitError as e:
        raise ValueError("Limite de taux OpenAI atteinte. Veuillez réessayer plus tard.") from e
    except BadRequestError as e:
        raise ValueError("Requête invalide envoyée à l'API OpenAI.") from e
    except APITimeoutError as e:
        raise ValueError("Délai d'attente de l'API OpenAI dépassé.") from e
    except Exception as e:
        raise ValueError(f"Erreur inattendue : {str(e)}") from e