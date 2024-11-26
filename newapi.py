from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import yfinance as yf
import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import UnstructuredURLLoader, PyPDFLoader
from langchain_community.vectorstores import FAISS
import json
import uvicorn
import logging
from fastapi.logger import logger
from fastapi.responses import JSONResponse

app = FastAPI()

# Update CORS settings
origins = [
    "http://localhost:3000",     # React local development
    "http://localhost:8000",     # FastAPI local development
    "https://your-frontend-domain.com",  # Your deployed frontend URL
    "*"  # During development - remove in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    google_api_key=GOOGLE_API_KEY,
    convert_system_message_to_human=True
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger.setLevel(logging.INFO)

# Add this after your FastAPI app initialization
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up FastAPI application")
    
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down FastAPI application")

# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# API endpoints for Finance AI Analyst
@app.post("/api/analyze-news")
async def analyze_news(request: NewsRequest):
    try:
        if not request.urls:
            raise HTTPException(status_code=400, detail="No URLs provided")

        # Add validation for URLs
        for url in request.urls:
            if not url.startswith(('http://', 'https://')):
                raise HTTPException(status_code=400, detail=f"Invalid URL format: {url}")

        # Process news articles with error handling
        try:
            loader = UnstructuredURLLoader(urls=request.urls)
            documents = loader.load()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error loading URLs: {str(e)}")

        if not documents:
            raise HTTPException(status_code=400, detail="No content could be extracted from the provided URLs")
            
        # Split documents
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,  # Reduced chunk size
            chunk_overlap=50,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""],
        )
        docs = text_splitter.split_documents(documents)
        
        # Create embeddings with error handling
        try:
            embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=GOOGLE_API_KEY,
                task_type="retrieval_query"
            )
            vectorstore = FAISS.from_documents(docs, embeddings)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating embeddings: {str(e)}")
        
        if request.query:
            try:
                chain = RetrievalQA.from_chain_type(
                    llm=llm,
                    chain_type="stuff",
                    retriever=vectorstore.as_retriever(
                        search_kwargs={"k": 3}  # Limit to top 3 most relevant chunks
                    ),
                    return_source_documents=True
                )
                result = chain.invoke({"query": request.query})  # Use invoke instead of __call__
                return {
                    "result": result["result"],
                    "sources": [doc.metadata for doc in result["source_documents"]]
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

        return {"status": "News articles processed successfully"}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in analyze_news: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

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

def fetch_latest_price(symbol):
    stock = yf.Ticker(symbol)
    data = stock.history(period="1d")
    return data['Close'][0]

def fetch_historical_data(symbol):
    stock = yf.Ticker(symbol)
    return stock.history(period="1mo")

def fetch_fundamentals(symbol):
    stock = yf.Ticker(symbol)
    return stock.info

def generate_stock_recommendation(fundamentals, current_price, previous_price, trend_change):
        recommendation = ""
        reasons = []
        overall_sentiment = "neutral"  # Initialize overall sentiment

        # Price-to-Earnings (PE) Ratio
        pe_ratio = fundamentals.get('PE Ratio', 'N/A')
        if pe_ratio != 'N/A':
            if pe_ratio > 25:
                reasons.append(f"The current PE ratio of {pe_ratio} suggests that the stock is overvalued.")
                overall_sentiment = "sell"  # Overvalued suggests selling
            elif pe_ratio < 15:
                reasons.append(f"The current PE ratio of {pe_ratio} indicates that the stock is undervalued.")
                overall_sentiment = "buy"  # Undervalued suggests buying
            else:
                reasons.append(f"The current PE ratio of {pe_ratio} indicates that the stock is fairly valued.")

        # Dividend Yield
        dividend_yield = fundamentals.get('Dividend Yield', 'N/A')
        if dividend_yield != 'N/A':
            if dividend_yield < 0.02:
                reasons.append(f"With a dividend yield of {dividend_yield:.2%}, the stock offers low returns on dividends.")
                overall_sentiment = "hold"  # Low yield suggests holding
            elif dividend_yield > 0.05:
                reasons.append(f"A dividend yield of {dividend_yield:.2%} indicates strong income potential.")
                overall_sentiment = "buy"  # High yield suggests buying
            else:
                reasons.append(f"A dividend yield of {dividend_yield:.2%} is moderate.")

        # Debt-to-Equity Ratio
        debt_to_equity = fundamentals.get('Debt-to-Equity Ratio', 'N/A')
        if debt_to_equity != 'N/A':
            if debt_to_equity > 1:
                reasons.append(f"The debt-to-equity ratio of {debt_to_equity} suggests high leverage, increasing financial risk.")
                overall_sentiment = "sell"  # High debt suggests selling
            elif debt_to_equity < 0.5:
                reasons.append(f"With a debt-to-equity ratio of {debt_to_equity}, the company is in a strong financial position.")
                overall_sentiment = "buy"  # Low debt suggests buying
            else:
                reasons.append(f"The debt-to-equity ratio of {debt_to_equity} indicates moderate leverage.")

        # Return on Equity (ROE)
        return_on_equity = fundamentals.get('Return on Equity', 'N/A')
        if return_on_equity != 'N/A':
            if return_on_equity < 0:
                reasons.append("The negative return on equity indicates that the company is not generating profit from its equity.")
                overall_sentiment = "sell"  # Negative ROE suggests selling
            elif return_on_equity > 15:
                reasons.append(f"An ROE of {return_on_equity}% reflects strong profitability.")
                overall_sentiment = "buy"  # Strong ROE suggests buying
            else:
                reasons.append(f"An ROE of {return_on_equity}% indicates moderate profitability.")

        # Profit Margin
        profit_margin = fundamentals.get('Profit Margin', 'N/A')
        if profit_margin != 'N/A':
            if profit_margin < 0:
                reasons.append("A negative profit margin indicates that the company is losing money on its sales.")
                overall_sentiment = "sell"  # Negative margin suggests selling
            elif profit_margin > 0.2:
                reasons.append(f"A profit margin of {profit_margin:.2%} suggests strong financial health.")
                overall_sentiment = "buy"  # High margin suggests buying
            else:
                reasons.append(f"A profit margin of {profit_margin:.2%} indicates moderate profitability.")

        # Current Price vs Previous Price
        if current_price and previous_price:
            price_change = ((current_price - previous_price) / previous_price) * 100
            if price_change > 5:
                reasons.append(f"The stock has increased by {price_change:.2f}%, reflecting positive investor sentiment.")
                if overall_sentiment == "neutral":
                    overall_sentiment = "hold"  # Positive change suggests holding
            elif price_change < -5:
                reasons.append(f"The stock has decreased by {price_change:.2f}%, which may suggest negative market sentiment.")
                overall_sentiment = "sell"  # Negative change suggests selling

        # Trend Analysis
        if trend_change > 0:
            reasons.append("A positive trend indicates potential growth, making it a favorable investment.")
            if overall_sentiment == "neutral":
                overall_sentiment = "buy"  # Positive trend suggests buying
        elif trend_change < 0:
            reasons.append("A negative trend suggests caution, as it may indicate underlying issues with the company.")
            if overall_sentiment == "neutral":
                overall_sentiment = "sell"  # Negative trend suggests selling

        # Final Recommendation
        if overall_sentiment == "buy":
            recommendation = "Overall, the stock is a good buy based on the analysis of its fundamentals and market trends."
        elif overall_sentiment == "sell":
            recommendation = "Overall, the stock is not recommended for purchase based on the analysis of its fundamentals and market trends."
        else:
            recommendation = "Overall, the stock is a hold based on the analysis of its fundamentals and market trends."

        detailed_recommendation = f"{recommendation} Reasons: " + " ".join(reasons)
        return detailed_recommendation

def generate_financial_advice(metrics, data, query):
        model = genai.GenerativeModel(model_name='gemini-pro',
                                generation_config={
                                    'temperature': 0.7,
                                    'top_p': 0.8,
                                    'max_output_tokens': 2048,
                                })
        prompt = f"""
        As a personal financial advisor, provide brief, goal-oriented advice for this query:

        User's Financial Goals:
        {json.dumps(data.goals, indent=2)}

        Current Financial Snapshot:
        - Monthly Income: ₹{data.income:,}
        - Monthly Expenses: ₹{metrics['total_expenses']:,}
        - Monthly Savings: ₹{metrics['monthly_savings']:,}
        - Total Investments: ₹{metrics['total_investments']:,}
        - Total Debts: ₹{metrics['total_debts']:,}

        User Query: {query}

        Provide a response that:
        1. Directly answers the specific question
        2. Links advice to their stated financial goals if it related to them
        3. Gives actionable steps with specific numbers with maximum 5 actionable steps if required
        4. Uses simple language and bullet points
        5. Keeps total response under 300 to 400 words

        Format the response as:
        • Direct answer to query
        • if required , give 2-3 specific action items with numbers
        • Connection to relevant financial goal(s)
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating advice: {str(e)}"

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."}
    )

# Update the main block to use environment port
if __name__ == "__main__":
    # Check if running on Render
    is_render = os.environ.get('IS_RENDER', False)
    
    if is_render:
        # Production settings for Render
        port = int(os.environ.get("PORT", 10000))
        uvicorn.run(
            "newapi:app",
            host="0.0.0.0",
            port=port,
            workers=4,
            reload=False
        )
    else:
        # Local development settings
        uvicorn.run(
            "newapi:app",
            host="127.0.0.1",  # localhost
            port=8000,
            reload=True  # Enable auto-reload for development
        )
