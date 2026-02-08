
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from openai import OpenAI
import google.generativeai as genai
import requests
import os
from dotenv import load_dotenv
import time
import asyncio
import aiohttp
import ssl
import certifi
from enum import Enum


load_dotenv()


genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
gemini_model = genai.GenerativeModel('gemini-flash-latest')

serpapi_key = os.getenv('SERPAPI_KEY')

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
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for history (use database in production)
research_history = []

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
        min_length=10,
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
        if len(v.strip()) < 10:
            raise ValueError('Question must be at least 10 characters')
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
    model_used: str = "Google Gemini Flash Latest (FREE)"

class HealthResponse(BaseModel):
    status: str
    gemini_configured: bool
    serpapi_configured: bool
    timestamp: str
    model: str = "Google Gemini Flash Latest"

class ErrorResponse(BaseModel):
    error: str
    detail: str
    timestamp: str

# ============================================
# CORE RESEARCH FUNCTIONS
# ============================================

def break_down_query(question: str) -> List[str]:
    """
    Use Gemini to break down complex questions into search queries
    FREE - No cost!
    """
    try:
        prompt = f"""Break down this question into 3-4 specific, diverse search queries that will help find comprehensive information.

Question: {question}

Return ONLY a valid Python list of strings, nothing else.
Example format: ["query 1", "query 2", "query 3"]

Do not include any explanation, just the list."""

        response = gemini_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=200,
            )
        )
        
        # Parse response
        queries_str = response.text.strip()
        # Remove markdown code blocks if present
        queries_str = queries_str.replace('```python', '').replace('```', '').strip()
        queries = eval(queries_str)
        
        return queries
        
    except Exception as e:
        print(f"Error breaking down query with Gemini: {str(e)}")
        # Fallback: return original question
        return [question]

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
        url = result.get('link', '')
        
        if url in seen_urls:
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

        response = gemini_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2000,
            )
        )
        
        return response.text
        
    except Exception as e:
        return f"Error synthesizing answer: {str(e)}"

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
        gemini_configured=bool(os.getenv('GEMINI_API_KEY')),
        serpapi_configured=bool(os.getenv('SERPAPI_KEY')),
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
        if not os.getenv('GEMINI_API_KEY'):
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        if not os.getenv('SERPAPI_KEY'):
            raise HTTPException(status_code=500, detail="SerpAPI key not configured")
        
        # Step 1: Break down query
        queries = break_down_query(request.question)
        
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
        
        # Save to history
        research_history.append(response.dict())
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.get("/history")
async def get_history(limit: int = 10):
    """
    Get recent research history
    """
    return {
        "total": len(research_history),
        "history": research_history[-limit:]
    }

@app.delete("/history")
async def clear_history():
    """
    Clear research history
    """
    global research_history
    count = len(research_history)
    research_history = []
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

