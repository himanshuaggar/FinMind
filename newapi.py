from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import yfinance as yf
import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import UnstructuredURLLoader, PyPDFLoader
from langchain_community.vectorstores import FAISS

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

# Configure Google AI
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    temperature=0.7,
    google_api_key=GOOGLE_API_KEY
)

# Pydantic models for request/response
class NewsRequest(BaseModel):
    urls: List[str]
    query: Optional[str] = None

class FinancialData(BaseModel):
    income: float
    expenses: Dict[str, float]
    savings: float
    investments: Dict[str, float]
    debts: Dict[str, float]
    goals: List[str]

class ChatRequest(BaseModel):
    financial_data: FinancialData
    query: str

class StockRequest(BaseModel):
    symbol: str

# API endpoints for Finance AI Analyst
@app.post("/api/analyze-news")
async def analyze_news(request: NewsRequest):
    try:
        if not request.urls:
            raise HTTPException(status_code=400, detail="No URLs provided")

        # Process news articles
        loader = UnstructuredURLLoader(urls=request.urls)
        documents = loader.load()
        
        # Split documents
        text_splitter = RecursiveCharacterTextSplitter(
            separators=['\n\n', '\n', '.', ','],
            chunk_size=1000
        )
        docs = text_splitter.split_documents(documents)
        
        # Create embeddings
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vectorstore = FAISS.from_documents(docs, embeddings)
        
        if request.query:
            chain = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=vectorstore.as_retriever(),
                return_source_documents=True
            )
            result = chain({"query": request.query})
            return {"result": result["result"], "sources": [doc.metadata for doc in result["source_documents"]]}
        
        return {"status": "News articles processed successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-financial-reports")
async def analyze_financial_reports(files: List[UploadFile] = File(...), query: Optional[str] = None):
    try:
        documents = []
        for file in files:
            temp_path = f"temp_{file.filename}"
            with open(temp_path, "wb") as f:
                content = await file.read()
                f.write(content)
            loader = PyPDFLoader(temp_path)
            documents.extend(loader.load())
            os.remove(temp_path)

        # Process documents similar to news analysis
        text_splitter = RecursiveCharacterTextSplitter(
            separators=['\n\n', '\n', '.', ','],
            chunk_size=1000
        )
        docs = text_splitter.split_documents(documents)
        
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vectorstore = FAISS.from_documents(docs, embeddings)
        
        if query:
            chain = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=vectorstore.as_retriever(),
                return_source_documents=True
            )
            result = chain({"query": query})
            return {"result": result["result"], "sources": [doc.metadata for doc in result["source_documents"]]}
        
        return {"status": "Financial reports processed successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API endpoints for Financial Advisory Chatbot
@app.post("/api/chat")
async def chat_with_advisor(request: ChatRequest):
    try:
        # Calculate metrics
        metrics = calculate_financial_metrics(request.financial_data)
        
        # Generate advice using the existing function
        response = generate_financial_advice(metrics, request.financial_data, request.query)
        
        return {"response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API endpoints for Stock Financial Advisor
@app.post("/api/stock/analysis")
async def analyze_stock(request: StockRequest):
    try:
        # Fetch stock data
        stock = yf.Ticker(request.symbol)
        
        # Get latest price
        latest_price = fetch_latest_price(request.symbol)
        
        # Get historical data
        historical_data = fetch_historical_data(request.symbol)
        
        # Get fundamentals
        fundamentals = fetch_fundamentals(request.symbol)
        
        # Generate recommendation
        recommendation = generate_stock_recommendation(
            fundamentals,
            latest_price,
            historical_data['Close'].iloc[-2] if historical_data is not None else None,
            (historical_data['Close'].iloc[-1] - historical_data['Close'].iloc[0]) / historical_data['Close'].iloc[0] * 100 if historical_data is not None else None
        )
        
        return {
            "symbol": request.symbol,
            "latest_price": latest_price,
            "historical_data": historical_data.to_dict() if historical_data is not None else None,
            "fundamentals": fundamentals,
            "recommendation": recommendation
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions (moved from app.py)
def calculate_financial_metrics(data: FinancialData):
    total_expenses = sum(data.expenses.values())
    total_investments = sum(data.investments.values())
    total_debts = sum(data.debts.values())
    monthly_savings = data.income - total_expenses
    debt_to_income = (total_debts / data.income * 100) if data.income > 0 else 0
    savings_rate = (monthly_savings / data.income * 100) if data.income > 0 else 0
    
    return {
        'total_expenses': total_expenses,
        'total_investments': total_investments,
        'total_debts': total_debts,
        'monthly_savings': monthly_savings,
        'debt_to_income': debt_to_income,
        'savings_rate': savings_rate
    }
