# Application de Chat LLM avec Streaming

Application de chat conversationnel intégrant l'API OpenAI (GPT-4o) avec affichage en temps réel des réponses via streaming Server-Sent Events (SSE).

## Fonctionnalités implémentées

- Chat conversationnel avec GPT-4o
- **Streaming en temps réel** : affichage token par token des réponses
- **Multi-tour** : gestion de l'historique de conversation avec contexte complet
- **Messages system** : configuration du comportement de l'assistant
- **Gestion d'erreur robuste** : messages d'erreur spécifiques (rate limit, auth, connexion, timeout)
- **Validation des inputs** : vérification des données côté backend
- **Timeout automatique** : abandon des requêtes après 30 secondes

## Description du projet

### Structure

```
streaming-llm-chat-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # Routes FastAPI + CORS
│   │   ├── models.py                # Modèles Pydantic (Message, ChatRequest)
│   │   └── services/
│   │       └── openai_service.py    # Logique OpenAI avec gestion d'erreur
│   ├── .env.example                 # Template de configuration
│   ├── requirements.txt             # Dépendances Python
│   └── .venv/                       # Environnement virtuel
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatMessage.tsx      # Affichage d'un message
    │   │   └── ChatInput.tsx        # Champ de saisie
    │   ├── services/
    │   │   └── api.ts               # Gestion SSE + AbortController
    │   ├── App.tsx                  # Composant racine + state management
    │   ├── main.tsx                 # Point d'entrée React
    │   ├── types.ts                 # Types TypeScript (Message)
    │   └── index.css                # Styles CSS
    ├── package.json                 # Dépendances npm
    │── .env.example                 # Template de configuration
    ├── vite.config.ts               # Configuration Vite
    └── tsconfig.json                # Configuration TypeScript
```
### Architecture

### Backend (FastAPI + Python)
**Choix de FastAPI** : Sélectionné pour sa performance asynchrone native, sa simplicité d'implémentation des Server-Sent Events et son excellente documentation automatique via OpenAPI.

**Couches applicatives** :
- Couche Route `main.py` : Gère les endpoints HTTP, la validation basique et le formatage SSE
- Couche Service `openai_service.py` : Contient la logique métier d'intégration OpenAI avec gestion d'erreurs spécifiques
- Couche Modèle `models.py` : Définit les schémas de données avec validation Pydantic

**Sécurité** : Initialement, l'historique de conversation était géré côté frontend. Pour des raisons de sécurité et de cohérence, cette responsabilité a été déplacée vers le backend. Cela permet :
- Une validation centralisée de l'historique
- La prévention de manipulations malveillantes
- La persistance des données liées à une sesion

### Frontend (React + TypeScript)
**Choix technique** : React pour sa réactivité et TypeScript pour la sécurité typée.

**Structure** :
- Couche de service (`api.ts`) isolant la logique SSE
- Composants dédiés (`ChatMessage`, `ChatInput`)
- State management local avec React hooks

**Streaming implémenté via** :
- Server-Sent Events (SSE) pour la simplicité et compatibilité
- ReadableStream API pour le parsing en temps réel

## Installation et Lancement

### Prérequis

- **Python 3.12+**
- **Node.js 18+** et npm
- **Clé API OpenAI**

### Installation Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv .venv

# Activer l'environnement virtuel
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer la clé API OpenAI
cp .env.example .env
# Éditer .env et ajouter votre clé : OPENAI_API_KEY=...
```

### Installation Frontend

```bash
cd frontend

# Installer les dépendances
npm install
```

### Lancement de l'Application

**Terminal 1 - Backend** :
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Le backend démarre sur `http://localhost:8000`

**Terminal 2 - Frontend** :
```bash
cd frontend
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

Ouvrez votre navigateur à l'adresse `http://localhost:5173` et commencez à discuter.

## Configuration

### Variables d'Environnement

**Backend** (`backend/.env`) :
```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=openai_model
CORS_ORIGINS=http://localhost:5173
SYSTEM_PROMPT=Tu es un assistant IA serviable et concis.
PORT=8000
```

> **Important** : Ne jamais committer le fichier `.env` (déjà dans `.gitignore`)

## Choix Techniques

### FastAPI

- **Asynchronicité native** : FastAPI permet de gérer efficacement des connexions longues de streaming sans bloquer le serveur.
- **Haute performance** : Les benchmarks montrent des performances supérieures à Flask et Django REST Framework, un point critique pour une application temps réel.
- **Support du streaming HTTP** : L’utilisation de `StreamingResponse` permet d’implémenter simplement des flux Server-Sent Events (SSE).
- **Validation automatique des données** : L’intégration avec Pydantic garantit des requêtes valides et structurées avant traitement.
- **Documentation automatique** : Swagger UI et ReDoc sont générés automatiquement, facilitant les tests, le débogage et la collaboration.
- **Cohérence avec l’écosystème Python** : Le projet s’inscrit dans une stack Python moderne, en phase avec les standards actuels.

### SSE

- **Flux unidirectionnel suffisant** : L’application nécessite uniquement un flux serveur → client, ce qui rend les autres alternatives comme WebSockets surdimensionnés.
- **Simplicité d’implémentation** : SSE repose sur HTTP standard et ne nécessite pas de gestion complexe des connexions.
- **Reconnexion automatique** : En cas de coupure réseau, le navigateur gère nativement la reconnexion.

### ReadableStream

- **API standard moderne** : Partie intégrante des Web APIs, supportée par tous les navigateurs récents.
- **Gestion mémoire efficace** : Les données sont traitées par chunks sans chargement complet en mémoire.
- **Mises à jour UI progressives** : Chaque chunk reçu peut déclencher une mise à jour fine de l’interface.

### React

- **Modèle déclaratif** : Idéal pour les interfaces mises à jour en temps réel via le streaming.
- **Architecture modulaire** : Composants réutilisables facilitant la maintenance et l’évolution.
- **Écosystème mature** : Large communauté, nombreuses bibliothèques et documentation riche.

### Conclusion

L’ensemble de ces choix forme une architecture cohérente, performante et moderne, parfaitement adaptée à une application de chat en streaming temps réel, tout en restant simple à maintenir et à faire évoluer.