from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

import os
from dotenv import load_dotenv
import time
import asyncio
import aiohttp
import ssl
import certifi
from enum import Enum
import json
from openai import OpenAI


load_dotenv()


# Initialize Groq client
groq_client = OpenAI(
    api_key=os.getenv('GROQ_API_KEY'),
    base_url="https://api.groq.com/openai/v1"
)
# Use environment variable for model, fallback to a supported model
groq_model = os.getenv('GROQ_MODEL', "llama-3.3-70b-versatile")
print(f"✅ Groq Client initialized with model: {groq_model}")
serpapi_key = os.getenv('SERPAPI_KEY')
mongo_uri = os.getenv('MONGO_URI')

# Initialize MongoDB
from motor.motor_asyncio import AsyncIOMotorClient
try:
    mongo_client = AsyncIOMotorClient(
        mongo_uri,
        tlsAllowInvalidCertificates=True  # Disable SSL verification for development
    )
    db = mongo_client.research_assistant
    history_collection = db.history
    print("✅ Connected to MongoDB")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    history_collection = None

# In-memory fallback for history when MongoDB is not available
research_history_memory = []

# ============================================
# FASTAPI APP CONFIGURATION
# ============================================

app = FastAPI(
    title="AI Research Assistant API",
    description="A sophisticated research assistant that combines web search with LLM synthesis to answer questions with proper citations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - allows frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting for Groq API
last_request_time = 0
min_request_interval = 5 

def rate_limit():
    """Simple rate limiting helper to prevent quota exhaustion"""
    global last_request_time
    current_time = time.time()
    time_since_last = current_time - last_request_time

    if time_since_last < min_request_interval:
        sleep_time = min_request_interval - time_since_last
        time.sleep(sleep_time)

    last_request_time = time.time()

# ============================================
# PYDANTIC MODELS (Request/Response Schemas)
# ============================================

class DetailLevel(str, Enum):
    brief = "brief"
    moderate = "moderate"
    comprehensive = "comprehensive"

class ResearchRequest(BaseModel):
    question: str = Field(
        ..., 
        min_length=2,
        max_length=500,
        description="The research question to answer"
    )
    num_sources: int = Field(
        5,
        ge=3,
        le=10,
        description="Number of sources to use per query"
    )
    detail_level: DetailLevel = Field(
        DetailLevel.moderate,
        description="Level of detail in the answer"
    )
    
    @validator('question')
    def validate_question(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Question must be at least 2 characters')
        return v.strip()

class Source(BaseModel):
    title: str
    url: str
    snippet: str
    search_query: Optional[str] = None

class ResearchResponse(BaseModel):
    question: str
    answer: str
    sources: List[Source]
    queries_used: List[str]
    timestamp: str
    processing_time: float
    model_used: str = "Llama 3 8B (Groq)"

class HealthResponse(BaseModel):
    status: str
    groq_configured: bool
    serpapi_configured: bool
    mongo_configured: bool = False
    timestamp: str
    model: str = "Groq"

class ErrorResponse(BaseModel):
    error: str
    detail: str
    timestamp: str


# ============================================
# CORE RESEARCH FUNCTIONS
# ============================================

def break_down_query(question: str) -> List[str]:
    """Use the LLM (Groq) to break a complex question into 3-4 search queries.
    Also checks for greetings or gibberish.

    Falls back to simple heuristic queries on any error.
    """
    try:
        # Rate limiting
        rate_limit()

        prompt = f"""Analyze the user input: "{question}"

Classification Rules:
1. If it is a greeting (e.g., "hello", "hi", "good morning"), return strictly: ["GREETING"]
2. If it is gibberish/nonsense (e.g., "asdf", "jkl;", "hgfcghvjbkn"), return strictly: ["INVALID"]
3. If it is a valid topic/question, break it down into 3-4 distinct search queries.

Return ONLY a valid Python list of strings. No code blocks."""

        response = groq_client.chat.completions.create(
            model=groq_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200,
        )

        queries_str = response.choices[0].message.content.strip()
        queries_str = queries_str.replace('```python', '').replace('```', '').strip()

        # Try to parse as JSON first, then fallback to eval, then simple newline split
        try:
            queries = json.loads(queries_str)
        except Exception:
            try:
                queries = eval(queries_str)
            except Exception:
                lines = [line.strip().strip('\"\'') for line in queries_str.split('\n') if line.strip()]
                queries = [line for line in lines if line and not line.startswith('[') and not line.startswith(']')]

        if not isinstance(queries, list):
            queries = [str(queries)]

        return queries

    except Exception as e:
        print(f"Error with Groq API while breaking query: {str(e)}")
        # Fallback queries
        return [
            question,
            f"{question} latest information",
            f"{question} explained",
            f"{question} examples"
        ]

async def search_web_async(query: str, num_results: int = 5) -> List[dict]:
    """
    Async search using SerpAPI
    """
    try:
        params = {
            'q': query,
            'api_key': serpapi_key,
            'num': num_results,
            'hl': 'en'
        }
        
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        
        async with aiohttp.ClientSession(connector=connector) as session:
            async with session.get(
                'https://serpapi.com/search',
                params=params,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                data = await response.json()
                results = data.get('organic_results', [])
                
                # Add query context
                for result in results:
                    result['search_query'] = query
                
                return results
                
    except asyncio.TimeoutError:
        print(f"Search timeout for query: {query}")
        return []
    except Exception as e:
        print(f"Search error for '{query}': {str(e)}")
        return []

async def search_web_parallel(queries: List[str], num_results: int = 5) -> List[dict]:
    """
    Execute multiple searches in parallel for better performance
    """
    tasks = [search_web_async(query, num_results) for query in queries]
    results = await asyncio.gather(*tasks)
    
    # Flatten results
    all_results = []
    for result_list in results:
        all_results.extend(result_list)
    
    return all_results

def extract_relevant_info(search_results: List[dict], max_sources: int = 10) -> List[Source]:
    """
    Extract and structure relevant information from search results
    """
    sources = []
    seen_urls = set()
    
    for result in search_results:
        # Try different possible URL field names
        url = result.get('link') or result.get('url') or result.get('href', '')
        
        if url in seen_urls or not url:
            continue
        
        source = Source(
            title=result.get('title', 'No title'),
            snippet=result.get('snippet', ''),
            url=url,
            search_query=result.get('search_query', '')
        )
        
        sources.append(source)
        seen_urls.add(url)
        
        if len(sources) >= max_sources:
            break
    
    return sources

def synthesize_answer(question: str, sources: List[Source], detail_level: str) -> str:
    """
    Use LLM to synthesize information into a coherent answer
    """
    if len(sources) < 2:
        return f"""I found limited information about your question ({len(sources)} sources). 
 
**Suggestions:**
- Try rephrasing your question
- Break it into smaller, more specific questions
- Check for spelling or terminology issues
 
Available information:
{chr(10).join([f"[{i+1}] {s.title}: {s.snippet}" for i, s in enumerate(sources)])}"""
    
    # Prepare context from sources
    context = ""
    for i, source in enumerate(sources, 1):
        context += f"\n[{i}] **{source.title}**\n"
        context += f"Content: {source.snippet}\n"
        context += f"URL: {source.url}\n"
    
    # Detail level instructions
    detail_instructions = {
        "brief": "Provide a concise 2-3 paragraph answer.",
        "moderate": "Provide a comprehensive answer with 4-6 paragraphs.",
        "comprehensive": "Provide a detailed, thorough answer with multiple sections."
    }
    
    try:
        # Rate limiting
        rate_limit()

        prompt = f"""You are an expert research assistant. Synthesize information from multiple sources into a clear, well-structured answer.
 
Guidelines:
1. {detail_instructions.get(detail_level, detail_instructions["moderate"])}
2. Cite sources using [1], [2], etc. format
3. If sources contradict, acknowledge different viewpoints
4. Maintain an objective, informative tone
5. Organize information logically
6. Include relevant examples or data points
7. End with a brief conclusion or summary
 
Question: {question}
 
Sources:
{context}
 
Provide a well-researched answer based on these sources. Use proper citations [1], [2], etc."""

        response = groq_client.chat.completions.create(
            model=groq_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2000,
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error with Groq API: {error_msg}")
        
        # Enhanced Fallback: Show error message clearly
        fallback_response = f"""**⚠️ AI Synthesis Failed**
        
*System Error: {error_msg}*

Since I couldn't synthesize a summary, here are the raw search results:

**Question:** {question}

**Summary of Findings (Raw Snippets):**
{chr(10).join([f"• **{s.title}**: {s.snippet[:200]}..." for s in sources[:5]])}

**Sources:**
{chr(10).join([f"[{i+1}] {s.title} - {s.url}" for i, s in enumerate(sources)])}
"""
        return fallback_response
 
# ============================================
# API ENDPOINTS
# ============================================
 
 
 
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint to verify API configuration
    """
    return HealthResponse(
        status="healthy",
        groq_configured=bool(os.getenv('GROQ_API_KEY')),
        serpapi_configured=bool(os.getenv('SERPAPI_KEY')),
        mongo_configured=bool(history_collection is not None),
        timestamp=datetime.now().isoformat()
    )
 
@app.post("/research", response_model=ResearchResponse)
async def research_question(request: ResearchRequest):
    """
    Main endpoint: Takes a question and returns a researched answer
    
    Process:
    1. Break down the question into search queries
    2. Search the web in parallel
    3. Extract relevant information
    4. Synthesize answer using LLM
    5. Return structured response with citations
    """
    start_time = time.time()
    
    try:
        # Validate API keys
        if not os.getenv('GROQ_API_KEY'):
            raise HTTPException(status_code=500, detail="Groq API key not configured")
        if not os.getenv('SERPAPI_KEY'):
            raise HTTPException(status_code=500, detail="SerpAPI key not configured")
        
        # Step 1: Break down query
        queries = break_down_query(request.question)
        
        # Handle Edge Cases (Greeting / Invalid)
        if queries == ["GREETING"]:
            return ResearchResponse(
                question=request.question,
                answer="Hello! I am your AI research assistant. I can help you find information on any topic. What would you like to research today?",
                sources=[],
                queries_used=[],
                timestamp=datetime.now().isoformat(),
                processing_time=time.time() - start_time
            )
            
        if queries == ["INVALID"]:
            return ResearchResponse(
                question=request.question,
                answer="I'm sorry, I didn't quite catch that. It looks like the input might be unclear or random characters. Could you please rephrase your question?",
                sources=[],
                queries_used=[],
                timestamp=datetime.now().isoformat(),
                processing_time=time.time() - start_time
            )

        # Step 2: Search web (parallel for speed)
        search_results = await search_web_parallel(queries, request.num_sources)
        
        # Step 3: Extract relevant information
        sources = extract_relevant_info(search_results, max_sources=10)
        
        if not sources:
            raise HTTPException(
                status_code=404,
                detail="No relevant sources found. Try rephrasing your question."
            )
        
        # Step 4: Synthesize answer
        answer = synthesize_answer(
            request.question,
            sources,
            request.detail_level.value
        )
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Create response
        response = ResearchResponse(
            question=request.question,
            answer=answer,
            sources=sources,
            queries_used=queries,
            timestamp=datetime.now().isoformat(),
            processing_time=processing_time
        )
        
        # Save to history (MongoDB or Memory)
        history_item = response.dict()
        
        if history_collection is not None:
            await history_collection.insert_one(history_item)
        else:
            research_history_memory.append(history_item)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
 
@app.get("/history")
async def get_history(limit: int = 10):
    """
    Get recent research history from MongoDB
    """
    if history_collection is not None:
        # Fetch from MongoDB
        cursor = history_collection.find().sort("timestamp", -1).limit(limit)
        history = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string for JSON serialization
        for item in history:
            if "_id" in item:
                item["_id"] = str(item["_id"])
    else:
        # Fallback to memory
        history = research_history_memory[-limit:]

    return {
        "total": await history_collection.count_documents({}) if history_collection is not None else len(research_history_memory),
        "history": history
    }

@app.delete("/history")
async def clear_history():
    
    if history_collection is not None:
        result = await history_collection.delete_many({})
        count = result.deleted_count
    else:
        global research_history_memory
        count = len(research_history_memory)
        research_history_memory = []
        
    return {"message": f"Cleared {count} items from history"}

# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
