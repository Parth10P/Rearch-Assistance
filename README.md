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
- [Key Features](#key-features)
- [Tech Stack & Rationale](#tech-stack--rationale)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Detailed Setup .env](#detailed-setup)
- [API Reference](#api-reference)

---

## Overview

AI Research Assistant searches the web, aggregates multi-source evidence, and uses an LLM to synthesize concise, well-cited answers. Built quickly with production patterns in mind, this project demonstrates modern async Python engineering, cost-conscious design, and a polished React UI.

---

## Key Features

- 🔍 Multi-source research (SerpAPI)
- 🤖 LLM-powered synthesis (Google Gemini / OpenAI-compatible adapter)
- 📚 Source citation cards and clickable links
- ⚡ Async backend with parallel searches and caching
- 💾 Optional MongoDB persistence for history & caching
- 🌙 Dark mode and responsive mobile-first UI
- 📈 Basic analytics / request tracking (DB-backed)
- ♻️ Search caching to reduce API costs (example: reduces repeated search API calls by ~40%)
- 📦 Export conversation (JSON)

---

## Tech Stack & Rationale

- **Backend:** Python 3.13 + FastAPI, MongoDB(Database)
- **LLM:** Google Gemini via OpenAI => Groq api
- **Search:** SerpAPI — reliable search results with a free tier for prototyping.

- **Frontend:** React + Vite + TailwindCSS and responsive styling.

## Architecture

High-level ASCII diagram:

```text
User (browser)
   |
   v
Frontend (React + Vite)
   |
   v  POST /research (XHR/fetch)
Backend (FastAPI)
  /   |    \
 /    |     \
v     v      v
SerpAPI  Groq/Gemini  MongoDB (cache/history)
(search)  (LLM)        (caching, analytics)

Notes: searches run in parallel; results cached in Mongo; LLM synthesizes using search snippets + cached context.
```

**Data flow summary:**

1. Frontend sends a query to `POST /research`.
2. Backend creates search queries and calls SerpAPI in parallel.
3. Search results are normalized and cached (DB or in-memory fallback).
4. Backend assembles a prompt and calls the LLM.
5. LLM response plus structured source metadata returned to frontend.

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
cp .env.example .env  # fill in values
```

3. Setup frontend

```bash
cd ../frontend
npm install
```

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

### POST /research

Start a research request. Runs parallel web searches, caches results, and calls the LLM to synthesize an answer.

**Request body (JSON):**

```json
{
  "question": "Explain quantum computing in simple terms",
  "context": "optional, previous messages or scope",
  "max_sources": 5
}
```

**Response (200):**

```json
{
  "answer": "... synthesized text ...",
  "sources": [{ "title": "Article 1", "url": "https://...", "snippet": "..." }],
  "meta": { "model": "mixtral-...", "elapsed_ms": 1234 }
}
```

**Errors:**

- `400` Validation error (bad request)
- `401` Missing/invalid API key (LLM or SerpAPI)
- `500` Internal server error

**Example curl:**

```bash
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"question":"What is CRISPR?","max_sources":3}'
```

---

## Database Schema (conceptual)

- **conversations**
  - `_id`
  - `question`
  - `answer`
  - `sources` (array of `{title, url, snippet}`)
  - `created_at`

- **cache**
  - `_id` (hash)
  - `query`
  - `results`
  - `created_at`, `ttl`

- **analytics**
  - `event`
  - `value`
  - `timestamp`

---

<!--
## Roadmap & Future Work

- Add user accounts and per-user history
- Improve analytics dashboards
- Background job queue for heavy/long-running jobs
- Cache invalidation UI and TTL policies
- CI/CD and automated deploy previews

--- -->
