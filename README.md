# AI Research Assistant

A sophisticated research tool that combines the power of **Google Gemini** LLM with real-time **SerpAPI** web searches to provide comprehensive, cited answers to complex questions.

## Features

- **Intelligent Query Breakdown**: Deconstructs complex user questions into multiple targeted search queries using Gemini.
- **Parallel Web Search**: Executes concurrent searches via SerpAPI for high-speed information retrieval.
- **Synthesis & Citation**: Aggregates data from top sources and generates a cohesive answer with inline citations (e.g., `[1]`).
- **Modern UI**: A responsive, glassmorphic React interface with dark mode support.
- **Research History**: Optional MongoDB integration to save and retrieve past research (or in-memory fallback).

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS.
- **Backend**: Python, FastAPI, Uvicorn.
- **AI Engine**: Google Gemini 1.5 Flash (via `google-generativeai`).
- **Search Engine**: SerpAPI (Google Search).
- **Database**: MongoDB (optional).

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **API Keys**:
  - [Google Gemini API Key](https://aistudio.google.com/app/apikey)
  - [SerpAPI Key](https://serpapi.com/)
- **MongoDB** (Optional, for persistent history)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd research-assistant
```

### 2. Backend Setup

Navigate to the root directory (where `app.py` is located):

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
context\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configuration**:
Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_key_here
SERPAPI_KEY=your_serpapi_key_here
MONGO_URI=mongodb://localhost:27017 (Optional)
```

**Run the Server**:

```bash
uvicorn app:app --reload --port 8000
```

The backend will start at `http://localhost:8000`.

### 3. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will start at `http://localhost:5173`.

## Usage

1.  Open the frontend URL in your browser.
2.  Enter a research topic in the chat input (e.g., _"Impact of AI on healthcare in 2024"_).
3.  Adjust settings (Number of Sources, Detail Level) via the settings icon if desired.
4.  The system will:
    - Break down your query.
    - Search the web.
    - Synthesize an answer with citations.
    - Display source cards for further reading.

## Architecture & Design

The system is designed for **accuracy** and **traceability**.
Unlike standard chatbots that hallucinate, this assistant retrieves real-time data first.

**Data Flow**:
`Input` -> `Gemini (Query Gen)` -> `SerpAPI (Parallel Search)` -> `Content Extraction` -> `Gemini (Synthesis)` -> `Output`

For a detailed deep-dive into the architecture, please refer to [architecture.md](./architecture.md).
