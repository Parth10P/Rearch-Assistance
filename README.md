<div align="center">

# Research Assistant

**Intelligent web research, evidence-backed answers, and a beautiful chat UI**

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)

</div>

## Table of Contents

- [Overview](#overview)
- [Tech Stack & Rationale](#tech-stack--rationale)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [OR: for quick start](#or-for-quick-start)
- [Detailed Setup .env](#detailed-setup)

---

## Overview

AI Research Assistant searches the web, aggregates multi-source evidence, and uses an LLM to synthesize concise, well-cited answers. Built quickly with production patterns in mind, this project demonstrates modern async Python engineering, cost-conscious design, and a polished React UI.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.11+, FastAPI |
| **LLM** | Groq (Llama-3.3-70b-versatile) |
| **Search** | SerpAPI |
| **Frontend** | React + Vite + TailwindCSS |
---

## Architecture

High-level ASCII diagram (detailed flow used by this project):

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                           🌐 USER : Browser                                 │
│                                                                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ 1. HTTP Request
                                 │ POST /research
                                 │ {question, num_sources, detail_level}
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────
│                         FRONTEND (React + Vite)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  App.jsx                                                            │   │
│  │  ├── ChatInput Component (User types question)                      │   │
│  │  ├── Settings (num_sources, detail_level)                           │   │
│  │  └── handleSendMessage() → calls API                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  services/api.js                                                    │   │
│  │  └── axios.post('http://localhost:8000/research', data)             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬───────────────────────────────────────────┘
                 │
                 │ 2. API Call (Axios)
                 │ JSON payload
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI + Python)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  backend/app.py                                                     │    │
│  │                                                                     │    │
│  │  @app.post("/research")                                             │    │
│  │  async def research_question(request: ResearchRequest):             │    │
│  │      ├── 3. Validate request (Pydantic)                             │    │
│  │      ├── 4. Check API keys                                          │    │
│  │      └── 5. Start processing...                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  STEP 1: Query Breakdown                                            │    │
│  │  ┌────────────────────────────────────────────────────────────┐     │    │
│  │  │ def break_down_query(question)                             │     │    │
│  │  │   └── Call Groq (OpenAI-compatible) API to expand queries ──┐    │    │
│  │  └────────────────────────────────────────────────────────────┼───────┘  │
│  └────────────────────────────────────────────────────────┼────────────┘    │
│                                                            │                │
│         ┌──────────────────────────────────────────────────┘                │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  STEP 2: Parallel Web Search                                        │    │
│  │  ┌────────────────────────────────────────────────────────────┐     │    │
│  │  │ async def search_web_parallel(queries)                     │     │    │
│  │  │                                                            │     │    │
│  │  │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │     |    │
│  │  │ │ Query 1 ────┼─▶│ Query 2 ────┼─▶│ Query 3 ────┼─┐        │     │    │
│  │  │ └─────────────┘  └─────────────┘  └─────────────┘ │        │     │    │
│  │  │                                                   │        │     │    │
│  │  │  ALL EXECUTE IN PARALLEL (async)                  │        │     │    │
│  │  └───────────────────────────────────────────────────┼────────┘     │    │
│  └──────────────────────────────────────────────────────┼──────────────┘    │
│         ┌───────────────────────────────────────────────┴──┬────────────────┘
│         │                                               │    │
│         ▼                                               ▼    ▼
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  │  🔍 SerpAPI     │  │  🔍 SerpAPI      │  │  🔍 SerpAPI     │
│  │  Search Query 1 │  │  Search Query 2 │  │  Search Query 3 │
│  │                 │  │                 │  │                 │
│  │  Returns:       │  │  Returns:       │  │  Returns:       │
│  │  - Title        │  │  - Title        │  │  - Title        │
│  │  - Snippet      │  │  - Snippet      │  │  - Snippet      │
│  │  - URL          │  │  - URL          │  │  - URL          │
│  │  (5 results)    │  │  (5 results)    │  │  (5 results)    │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
│           │                    │                    │
│           └────────────────────┴────────────────────┘
│                                │
│                                │ Combined: 15 results
│                                ▼
│  ┌────────────────────────────────────────────────────────────────────┐
│  │  STEP 3: Information Extraction & Deduplication                    │
│  │  ┌────────────────────────────────────────────────────────────┐    │
│  │  │ def extract_relevant_info(search_results)                  │    │
│  │  │                                                            │    │
│  │  │ Process:                                                   │    │
│  │  │ 1. Remove duplicate URLs                                   │    │
│  │  │ 2. Extract: title, snippet, url                            │    │
│  │  │ 3. Keep top 10 sources                                     │    │
│  │  │ 4. Create Source objects                                   │    │
│  │  │                                                            │    │
│  │  │ Output: [Source1, Source2, ... Source10]                   │    │
│  │  └────────────────────────────────────────────────────────────┘    │
│  └────────────────────────────────────────────────────────────────────┘
│                                 │
│                                 ▼
│  ┌────────────────────────────────────────────────────────────────────┐
│  │  STEP 4: Answer Synthesis                                          │
│  │  ┌────────────────────────────────────────────────────────────┐    │
│  │  │ def synthesize_answer(question, sources, detail_level)     │    │
│  │  │                                                            │    │
│  │  │ Prepare context:                                           │    │
│  │  │ [1] Title: "EV Carbon Footprint Study"                     │    │
│  │  │     Content: "EVs produce 50% less emissions..."           │    │
│  │  │     URL: https://example.com                               │    │
│  │  │                                                            │    │
│  │  │ [2] Title: "Battery Production Impact"                     │    │
│  │  │     Content: "Manufacturing batteries requires..."         │    │
│  │  │     URL: https://example2.com                              │    │
│  │  │ ...                                                        │    │
│  │  │                                                            │    │
│  │  │ Call Groq with full context ─────────────────────|         │    │
│  │  └──────────────────────────────────────────────────|─────────┘    │
│  └─────────────────────────────────────────────────────|──────────────┘
│         ┌──────────────────────────────────────────────┘
│         │
│         ▼
│  ┌────────────────────────────────────────────────────────────────────┐
│  │  🤖 GROQ (OpenAI-compatible LLM)                                   │
│  │  ┌────────────────────────────────────────────────────────────┐    │
│  │  │ Prompt: "You are a research assistant. Synthesize info"    │    │
│  │  │                                                            │    │
│  │  │ Context: [All 10 sources with content]                     │    │
│  │  │                                                            │    │
│  │  │ Requirements:                                              │    │
│  │  │ - Cite sources using [1], [2]                              │    │
│  │  │ - Organize logically                                       │    │
│  │  │ - Be objective                                             │    │
│  │  │ - Detail level: moderate                                   │    │
│  │  │                                                            │    │
│  │  │ Output:                                                    │    │
│  │  │ "Electric vehicles have significant environmental          │    │
│  │  │  benefits compared to gas cars [1]. While battery          │    │
│  │  │  production creates emissions [2], the lifecycle           │    │
│  │  │  impact is 40% lower [3]..."                               │    │
│  │  └────────────────────────────────────────────────────────────┘    │
│  └────────────────────────────────────────────────────────────────────┘
│                                 │
│                                 │ Returns: Synthesized answer
│                                 ▼
│  ┌────────────────────────────────────────────────────────────────────┐
│  │  STEP 5: Save to Database (Optional)                               │
│  │  ┌────────────────────────────────────────────────────────────┐    │
│  │  │ MongoDB (Motor - Async)                                    │    │
│  │  │                                                            │    │
│  │  │ await db.research_queries.insert_one({                     │    │
│  │  │   "question": "What are environmental...",                 │    │
│  │  │   "answer": "Electric vehicles have...",                   │    │
│  │  │   "sources": [...],                                        │    │
│  │  │   "queries_used": [...],                                   │    │
│  │  │   "processing_time": 8.5,                                  │    │
│  │  │   "timestamp": datetime.now()                              │    │
│  │  │ })                                                         │    │
│  │  │                                                            │    │
│  │  │ Cache search results:                                      │    │
│  │  │ await db.search_cache.insert_one({                         │    │
│  │  │   "query": "electric vehicles carbon",                     │    │
│  │  │   "results": [...],                                        │    │
│  │  │   "expires_at": 7 days from now                            │    │
│  │  │ })                                                         │    │
│  │  └────────────────────────────────────────────────────────────┘    │
│  └────────────────────────────────────────────────────────────────────┘
│                                 │
│                                 ▼
│  ┌────────────────────────────────────────────────────────────────────┐
│  │  STEP 6: Format Response                                           │
│  │  ┌────────────────────────────────────────────────────────────┐    │
│  │  │ return ResearchResponse(                                   │    │
│  │  │   question="What are environmental impacts of EVs?",       │    │
│  │  │   answer="Electric vehicles have...",                      │    │
│  │  │   sources=[                                                │    │
│  │  │     {title: "...", url: "...", snippet: "..."},            │    │
│  │  │     ...                                                    │    │
│  │  │   ],                                                       │    │
│  │  │   queries_used=["query1", "query2", "query3"],             │    │
│  │  │   timestamp="2024-02-08T10:30:00Z",                        │    │
│  │  │   processing_time=8.5,                                     │    │
│  │  │   model_used="GROQ-model"                                  │    │
│  │  │ )                                                          │    │
│  │  └────────────────────────────────────────────────────────────┘    │
│  └────────────────────────────────────────────────────────────────────|
└───────────────────────────────────────────────────────────────────────|
                 │
                 │ 7. JSON Response
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  services/api.js                                                    │   │
│  │  └── Receives JSON response from backend                            │   │
│  └─────────────────────────────┬───────────────────────────────────────┘   │
│                                │                                           │
│                                ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  App.jsx - handleSendMessage()                                      │   │
│  │                                                                     │   │
│  │  8. Process response:                                               │   │
│  │     ├── Create assistant message object                             │   │
│  │     ├── Add to messages state                                       │   │
│  │     └── Trigger re-render                                           │   │
│  └─────────────────────────────┬───────────────────────────────────────┘   │
│                                │                                           │
│                                ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  React Component Rendering                                          │   │
│  │                                                                     │   │
│  │  ChatMessage Component:                                             │   │
│  │  ├── Render user message (purple bubble)                            │   │
│  │  └── Render assistant message (white bubble)                        │   │
│  │      ├── ReactMarkdown for answer text                              │   │
│  │      ├── Source cards (grid layout)                                 │   │
│  │      │   └── Each source is clickable link                          │   │
│  │      └── Metadata (time, queries, model)                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬───────────────────────────────────────────┘
                 │
                 │ 9. Display to user
                 │
                 ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           🌐 USER SEES RESULT                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  ┌───────────────────────────────────────────────────────────┐     │   │
│  │  │ You: What are environmental impacts of EVs?               │     │   │
│  │  └───────────────────────────────────────────────────────────┘     │   │
│  │                                                                    │   │
│  │  ┌───────────────────────────────────────────────────────────┐     │   │
│  │  │ AI Research Assistant:                                    │     │   │
│  │  │                                                           │     │   │
│  │  │ Electric vehicles have significant environmental          │     │   │
│  │  │ benefits compared to gas cars [1]. While battery          │     │   │
│  │  │ production creates emissions [2], the lifecycle           │     │   │
│  │  │ impact is 40% lower [3]...                                │     │   │
│  │  │                                                           │     │   │
│  │  │ Sources (10):                                             │     │   │
│  │  │ ┌──────────────────┐  ┌──────────────────┐                │     │   │
│  │  │ │ [1] EV Carbon... │  │ [2] Battery Prod.│                │     │   │
│  │  │ │  example.com     │  │  example2.com    │                │     │   │
│  │  │ └──────────────────┘  └──────────────────┘                │     │   │
│  │  │                                                           │     │   │
│  │  │ ⏱ 8.5s | 3 queries | GROQ (OpenAI-compatible)             │     │   │
│  │  └───────────────────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
```

**Data flow summary:**

1. Frontend sends a query to `POST /research`.
2. Backend creates search queries and calls SerpAPI in parallel.
3. Search results are normalized and cached (MongoDB or in-memory fallback).
4. Backend assembles a prompt and calls the Groq (OpenAI-compatible) LLM.
5. LLM response plus structured source metadata returned to frontend and saved to DB (optional).

---

## Quick Start

1. Clone the repo

```bash
git clone <repo-url>
cd Rearch-Assistance
```

2. Setup backend

```bash
cd backend
python3.13 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

3. Setup frontend

```bash
cd ../frontend
npm install
```

---

## OR: for quick start

```bash
  ./setup.sh
```

```
cd backend && source venv/bin/activate && uvicorn app:app --reload
```

```
cd frontend && npm run dev
```

---

4. Run backend and frontend

Backend (local dev):

```bash
cd backend
source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port "${PORT:-8000}" --reload
```

Frontend:

```bash
cd frontend
npm run dev
```

Open the Vite dev URL (usually http://localhost:5173) and try a sample query.

---

## Detailed Setup

Environment variables (put in `backend/.env`):

```text
GROQ_API_KEY=your_groq_or_gemini_api_key
SERPAPI_KEY=your_serpapi_key
MONGO_URI=your_mongo_connection_string  # optional
GROQ_MODEL=optional_model_name
PORT=8000  # local only
DEBUG=true
ENVIRONMENT=development
```

- `GROQ_API_KEY` — key for the LLM provider (Gemini/Groq/OpenAI compatible)
- `SERPAPI_KEY` — SerpAPI key
- `MONGO_URI` — MongoDB connection (optional; if missing the app uses in-memory history)
- `GROQ_MODEL` — override the model used

Backend deps: `backend/requirements.txt`.
Frontend deps: `frontend/package.json`.

---

## API Reference

### POST `/research`

Submit a research query to the AI assistant.

**Request:**

```json
{
  "question": "What are the latest developments in quantum computing?",
  "num_sources": 3,
  "detail_level": "detailed"
}
```

**Response:**

```json
{
  "question": "What are the latest developments in quantum computing?",
  "answer": "Quantum computing has seen significant breakthroughs in error correction...",
  "sources": [
    {
      "title": "Quantum Computing Progress 2024",
      "url": "https://example.com/quantum",
      "snippet": "Researchers have demonstrated..."
    }
  ],
  "queries_used": [
    "latest quantum computing news",
    "quantum error correction milestones 2024"
  ],
  "processing_time": 4.5,
  "timestamp": "2024-02-10T15:30:00.000Z"
}
```

---

---

## Project Structure

```bash
Rearch-Assistance/
├── backend/                # FastAPI (Python)
│   ├── app.py              # API endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │   └── index.css
│   └── tailwind.config.js
│
└── README.md               # Project documentation
```
yash