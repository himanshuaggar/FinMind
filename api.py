from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
from datetime import datetime



# Import functionality from other files
from analyser import (
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
    RetrievalQA,
    FAISS,
    UnstructuredURLLoader,
    PyPDFLoader,
    RecursiveCharacterTextSplitter,
    PromptTemplate
)
from chat import (
    calculate_financial_metrics,
    generate_financial_advice,
    genai
)
from recommend import (
    fetch_latest_price,
    fetch_historical_data,
    fetch_fundamentals,
    generate_stock_recommendation,
    generate_detailed_advice
)

app = FastAPI(title="FinMind API", description="Financial Analysis and Advisory API")

origins = [
    "http://localhost",
    "http://localhost:3000",  # If using React
    "http://127.0.0.1:5173",  # If using Vite
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class FinancialData(BaseModel):
    income: float
    expenses: Dict[str, float]
    savings: float
    investments: Dict[str, float]
    debts: Dict[str, float]
    goals: List[str]

class ChatRequest(BaseModel):
    message: str
    financial_data: FinancialData

class StockRequest(BaseModel):
    symbol: str

class DocumentAnalysisRequest(BaseModel):
    urls: List[str]
    analysis_type: str
    query: str

# API endpoints
@app.post("/chat/advice")
async def get_financial_advice(request: ChatRequest):
    try:
        metrics = calculate_financial_metrics(request.financial_data.dict())
        response = generate_financial_advice(
            metrics, 
            request.financial_data.dict(), 
            request.message
        )
        return {"advice": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stocks/analysis")
async def get_stock_analysis(request: StockRequest, response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    try:
        latest_price = fetch_latest_price(request.symbol)
        historical_data = fetch_historical_data(request.symbol)
        fundamentals = fetch_fundamentals(request.symbol)
        recommendation = generate_stock_recommendation(fundamentals)
        detailed_advice = generate_detailed_advice(request.symbol)
        
        return {
            "symbol": request.symbol,
            "latest_price": latest_price,
            "recommendation": recommendation,
            "detailed_advice": detailed_advice,
            "fundamentals": fundamentals
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/analyze")
async def analyze_documents(
    files: List[UploadFile] = File(None),
    urls: str = Form(None),
    analysis_type: str = Form(...),
    query: str = Form(...)
):
    try:
        documents = []
        
        # Process URLs if provided
        if urls:
            url_list = json.loads(urls)
            if url_list:
                loader = UnstructuredURLLoader(urls=url_list)
                documents.extend(loader.load())

        # Process uploaded files
        if files:
            for file in files:
                temp_path = f"temp_{file.filename}"
                with open(temp_path, "wb") as f:
                    content = await file.read()
                    f.write(content)
                loader = PyPDFLoader(temp_path)
                documents.extend(loader.load())
                os.remove(temp_path)

        # Process documents
        text_splitter = RecursiveCharacterTextSplitter(
            separators=['\n\n', '\n', '.', ','],
            chunk_size=1000
        )
        docs = text_splitter.split_documents(documents)

        # Create embeddings and vector store
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vectorstore = FAISS.from_documents(docs, embeddings)

        # Initialize LLM and create chain
        llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            temperature=0.7
        )

        # Get analysis prompt
        analysis_prompt = get_analysis_prompt(analysis_type)
        
        chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(),
            return_source_documents=True,
            chain_type_kwargs={"prompt": analysis_prompt}
        )

        # Get analysis results
        result = chain({"query": query})

        return {
            "analysis": result["result"],
            "sources": [doc.metadata.get("source", "") for doc in result["source_documents"]]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)