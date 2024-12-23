from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import yfinance as yf
import os
import plotly.graph_objects as go
from datetime import datetime, timedelta
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
from langchain.prompts import PromptTemplate
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up FastAPI application")
    yield
    # Shutdown
    logger.info("Shutting down FastAPI application")

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",     
    "http://localhost:8000",     
    "https://your-frontend-domain.com",  
    "*" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)

llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    temperature=0.7,
    google_api_key=GOOGLE_API_KEY,
    convert_system_message_to_human=True
)

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
    
class MarketOverview(BaseModel):
    timestamp: str
    market_overview: dict
    market_analysis: str
    market_visualization: str | None
    metadata: dict
    
NIFTY_SECTORS = {
    'NIFTY AUTO': '^CNXAUTO',
    'NIFTY BANK': '^NSEBANK',
    'NIFTY FMCG': '^CNXFMCG',
    'NIFTY IT': '^CNXIT',
    'NIFTY METAL': '^CNXMETAL',
    'NIFTY PHARMA': '^CNXPHARMA',
    'NIFTY REALTY': '^CNXREALTY',
    'NIFTY ENERGY': '^CNXENERGY',
    'NIFTY FINANCIAL SERVICES': '^CNXFIN',
    'NIFTY MEDIA': '^CNXMEDIA',
    'NIFTY HEALTHCARE': 'NIFTY_HEALTHCARE.NS',
    'NIFTY CONSUMER DURABLES': 'NIFTY_CONSR_DURBL.NS',
    'NIFTY OIL AND GAS': 'NIFTY_OIL_AND_GAS.NS',
    'NIFTY METALS & MINING': '^CNXMETAL',
    'NIFTY CONSUMER SERVICES': '^CNXSERVICE', 
}

NIFTY500_SYMBOLS = [
    '3MINDIA.NS', 'AARTIIND.NS', 'AAVAS.NS', 'ABB.NS', 'ABBOTINDIA.NS',
    'ABCAPITAL.NS', 'ABFRL.NS', 'ACC.NS', 'ADANIENT.NS', 'ADANIGREEN.NS',
    'ADANIPORTS.NS', 'ADANIPOWER.NS', 'ADANITRANS.NS', 'ADVENZYMES.NS', 'AEGISCHEM.NS',
    'AFFLE.NS', 'AJANTPHARM.NS', 'AKZOINDIA.NS', 'ALEMBICLTD.NS', 'ALKEM.NS',
    'ALKYLAMINE.NS', 'ALLCARGO.NS', 'AMARAJABAT.NS', 'AMBER.NS', 'AMBUJACEM.NS',
    'APARINDS.NS', 'APLLTD.NS', 'APOLLOHOSP.NS', 'APOLLOTYRE.NS', 'ARVINDFASN.NS',
    'ASAHIINDIA.NS', 'ASHOKLEY.NS', 'ASIANPAINT.NS', 'ASTERDM.NS', 'ASTRAL.NS',
    'ATGL.NS', 'ATUL.NS', 'AUBANK.NS', 'AUROPHARMA.NS', 'AVANTIFEED.NS',
    'AWL.NS', 'AXISBANK.NS', 'BAJAJ-AUTO.NS', 'BAJAJCON.NS', 'BAJAJELEC.NS',
    'BAJAJFINSV.NS', 'BAJAJHLDNG.NS', 'BAJFINANCE.NS', 'BALAMINES.NS', 'BALKRISIND.NS',
    'BALRAMCHIN.NS', 'BANDHANBNK.NS', 'BANKBARODA.NS', 'BANKINDIA.NS', 'BASF.NS',
    'BATAINDIA.NS', 'BBTC.NS', 'BDL.NS', 'BEL.NS', 'BEML.NS',
    'BERGEPAINT.NS', 'BHARATFORG.NS', 'BHARATRAS.NS', 'BHARATWIRE.NS', 'BHARTIARTL.NS',
    'BHEL.NS', 'BIOCON.NS', 'BIRLACORPN.NS', 'BLUEDART.NS', 'BLUESTARCO.NS',
    'BOSCHLTD.NS', 'BPCL.NS', 'BRIGADE.NS', 'BRITANNIA.NS', 'BSE.NS',
    'BSOFT.NS', 'CANBK.NS', 'CANFINHOME.NS',
    'CAPLIPOINT.NS', 'CARBORUNIV.NS', 'CASTROLIND.NS', 'CCL.NS', 'CDSL.NS',
    'CEATLTD.NS', 'CENTRALBK.NS', 'CERA.NS', 'CESC.NS',
    'CHAMBLFERT.NS', 'CHEMPLASTS.NS', 'CHOLAFIN.NS', 'CIPLA.NS', 'COALINDIA.NS',
    'COCHINSHIP.NS', 'COFORGE.NS', 'COLPAL.NS', 'CONCOR.NS', 'COROMANDEL.NS',
    'CREDITACC.NS', 'CRISIL.NS', 'CROMPTON.NS', 'CSBBANK.NS', 'CUB.NS',
    'CUMMINSIND.NS', 'CYIENT.NS', 'DABUR.NS', 'DALBHARAT.NS', 'DBL.NS',
    'DCAL.NS', 'DCBBANK.NS', 'DCMSHRIRAM.NS', 'DEEPAKNTR.NS', 'DELTACORP.NS',
    'DEVYANI.NS', 'DHANI.NS', 'DIAMONDYD.NS', 'DIVISLAB.NS', 'DIXON.NS',
    'DLF.NS', 'DMART.NS', 'DRREDDY.NS', 'EASEMYTRIP.NS', 'ECLERX.NS',
    'EDELWEISS.NS', 'EICHERMOT.NS', 'EIDPARRY.NS', 'EIHOTEL.NS', 'ELGIEQUIP.NS',
    'EMAMILTD.NS', 'ENDURANCE.NS', 'ENGINERSIN.NS', 'EPL.NS', 'EQUITASBNK.NS',
    'ERIS.NS', 'ESCORTS.NS', 'ESABINDIA.NS', 'EXIDEIND.NS', 'FDC.NS',
    'FEDERALBNK.NS', 'FINEORG.NS', 'FLUOROCHEM.NS', 'FORTIS.NS', 'FSL.NS',
    'GAIL.NS', 'GALAXYSURF.NS', 'GARFIBRES.NS', 'GEPIL.NS', 'GESHIP.NS',
    'GHCL.NS', 'GICRE.NS', 'GILLETTE.NS', 'GLAND.NS', 'GLAXO.NS',
    'GLENMARK.NS', 'GMMPFAUDLR.NS', 'GNFC.NS', 'GODFRYPHLP.NS', 'GODREJAGRO.NS',
    'GODREJCP.NS', 'GODREJIND.NS', 'GODREJPROP.NS', 'GOKEX.NS', 'GOLDIAM.NS',
    'GRANULES.NS', 'GRAPHITE.NS', 'GRASIM.NS', 'GREAVESCOT.NS', 'GREENPANEL.NS',
    'GREENPLY.NS', 'GRINDWELL.NS', 'GRSE.NS', 'GSFC.NS', 'GSPL.NS',
    'GUJGASLTD.NS', 'GUJALKALI.NS', 'GUJFLUORO.NS', 'GUJGASLTD.NS', 'GULFOILLUB.NS',
    'HAPPSTMNDS.NS', 'HATSUN.NS', 'HAVELLS.NS', 'HCLTECH.NS',
    'HDFCAMC.NS', 'HDFCBANK.NS', 'HDFCLIFE.NS', 'HEG.NS', 'HEIDELBERG.NS',
    'HERITGFOOD.NS', 'HEROMOTOCO.NS', 'HFCL.NS', 'HIKAL.NS', 'HINDALCO.NS',
    'HINDCOPPER.NS', 'HINDPETRO.NS', 'HINDUNILVR.NS', 'HINDZINC.NS', 'HONAUT.NS',
    'HUDCO.NS', 'IBREALEST.NS', 'IBULHSGFIN.NS', 'ICICIBANK.NS', 'ICICIGI.NS',
    'ICICIPRULI.NS', 'IDEA.NS', 'IDFC.NS', 'IDFCFIRSTB.NS', 'IEX.NS',
    'IGL.NS', 'IIFSEC.NS', 'INDHOTEL.NS', 'INDIACEM.NS', 'INDIAMART.NS',
    'INDIGO.NS', 'INDOCO.NS', 'INDUSINDBK.NS', 'INDUSTOWER.NS', 'INFIBEAM.NS',
    'INFY.NS', 'INGERRAND.NS', 'INOXLEISUR.NS', 'IOB.NS', 'IOC.NS',
    'IPCALAB.NS', 'IRB.NS', 'IRCON.NS', 'ITC.NS', 'ITI.NS',
    'J&KBANK.NS', 'JAGRAN.NS', 'JAICORPLTD.NS', 'JAMNAAUTO.NS', 'JBCHEPHARM.NS',
    'JCHAC.NS', 'JINDALSAW.NS', 'JINDALSTEL.NS', 'JISLJALEQS.NS', 'JKCEMENT.NS',
    'JKLAKSHMI.NS', 'JKPAPER.NS', 'JKTYRE.NS', 'JMFINANCIL.NS', 'JSL.NS',
    'JSWENERGY.NS', 'JSWSTEEL.NS', 'JTEKTINDIA.NS', 'JUBLFOOD.NS', 'JUBLPHARMA.NS',
    'JUSTDIAL.NS', 'JYOTHYLAB.NS', 'KALPATPOWR.NS', 'KANSAINER.NS', 'KARURVYSYA.NS',
    'KAJARIACER.NS', 'KEC.NS', 'KEI.NS', 'KNRCON.NS', 'KOTAKBANK.NS',
    'KRBL.NS', 'KSCL.NS', 'KSB.NS', 'KTL.NS', 'L&TFH.NS',
    'LAOPALA.NS', 'LAXMIMACH.NS', 'LEMONTREE.NS', 'LICHSGFIN.NS', 'LINDEINDIA.NS',
    'LT.NS', 'LTI.NS', 'LTTS.NS', 'LUPIN.NS', 'LUXIND.NS',
    'M&M.NS', 'M&MFIN.NS', 'MAHABANK.NS', 'MAHINDCIE.NS', 'MAHLIFE.NS',
    'MANAPPURAM.NS', 'MARICO.NS', 'MARUTI.NS', 'MASFIN.NS', 'MASTEK.NS',
    'MFSL.NS', 'MGL.NS', 'MINDACORP.NS', 'MINDAIND.NS', 'MINDTREE.NS',
    'MOTILALOFS.NS', 'MPHASIS.NS', 'MRF.NS', 'MRPL.NS', 'MUTHOOTFIN.NS',
    'NATCOPHARM.NS', 'NATIONALUM.NS', 'NAUKRI.NS', 'NAVINFLUOR.NS', 'NBCC.NS',
    'NCC.NS', 'NESTLEIND.NS', 'NETWORK18.NS', 'NFL.NS', 'NH.NS',
    'NIACL.NS', 'NLCINDIA.NS', 'NMDC.NS', 'NTPC.NS', 'OBEROIRLTY.NS',
    'OIL.NS', 'ONGC.NS', 'PAGEIND.NS', 'PEL.NS', 'PERSISTENT.NS',
    'PETRONET.NS', 'PFC.NS', 'PFIZER.NS', 'PGHH.NS', 'PGHL.NS',
    'PHOENIXLTD.NS', 'PIDILITIND.NS', 'PIIND.NS', 'PNB.NS', 'POLYCAB.NS',
    'POLYMED.NS', 'POWERGRID.NS', 'PRAJIND.NS', 'PRESTIGE.NS', 'PRINCEPIPE.NS',
    'PRSMJOHNSN.NS', 'PSB.NS', 'PVR.NS', 'QUESS.NS', 'RADICO.NS',
    'RAIN.NS', 'RAJESHEXPO.NS', 'RALLIS.NS', 'RAMCOCEM.NS', 'RATNAMANI.NS',
    'RAYMOND.NS', 'RBLBANK.NS', 'RECLTD.NS', 'REDINGTON.NS', 'RELAXO.NS',
    'RELIANCE.NS', 'RENUKA.NS', 'RHIM.NS', 'RITES.NS', 'RVNL.NS',
    'TATAPOWER.NS', 'TATASTEEL.NS', 'TCS.NS', 'TECHM.NS', 'TITAN.NS',
    'TORNTPHARM.NS', 'TORNTPOWER.NS', 'TRENT.NS', 'TVSMOTOR.NS', 'UBL.NS',
    'ULTRACEMCO.NS', 'UPL.NS', 'VEDL.NS', 'VOLTAS.NS', 'WIPRO.NS',
    'ZEEL.NS','ZOMATO.NS','ZYDUSWELL.NS'
]


logging.basicConfig(level=logging.INFO)
logger.setLevel(logging.INFO)

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
        valid_urls = [url for url in request.urls if url and url.startswith(('http://', 'https://'))]
        if not valid_urls:
            raise HTTPException(status_code=400, detail="No valid URLs provided")

        # Process news articles with error handling
        try:
            # Initialize documents list
            documents = []
            loader = UnstructuredURLLoader(urls=valid_urls)
            documents.extend(loader.load())
            
            if not documents:
                raise HTTPException(status_code=400, detail="No content could be extracted from the provided URLs")
            
            # Split documents
            text_splitter = RecursiveCharacterTextSplitter(
                separators=['\n\n', '\n', '.', ','],  # Updated separators
                chunk_size=1000,  # Increased chunk size
                chunk_overlap=100
            )
            docs = text_splitter.split_documents(documents)
            
            # Create embeddings with error handling
            embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=GOOGLE_API_KEY
            )
            vectorstore = FAISS.from_documents(docs, embeddings)
            
            if request.query:
                # News analysis prompt template (matching app.py)
                news_template = """You are a financial news analyst. Analyze the provided news articles and answer the question.
                Focus on extracting key information, trends, and implications from the news.
                
                Consider:
                - Key facts and figures
                - Market impact
                - Industry implications
                - Related trends
                - Future outlook
                
                Context: {context}
                Question: {question}
                
                Provide a clear and concise analysis structured as follows:
                1. Key Points
                2. Analysis
                3. Implications
                4. Related Context"""
                
                news_prompt = PromptTemplate(
                    template=news_template,
                    input_variables=["context", "question"]
                )
                
                chain = RetrievalQA.from_chain_type(
                    llm=llm,
                    chain_type="stuff",
                    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
                    return_source_documents=True,
                    chain_type_kwargs={"prompt": news_prompt}
                )
                
                result = chain.invoke({"query": request.query})
                
                # Format response
                return {
                    "result": result["result"],
                    "sources": [
                        {
                            "source": doc.metadata.get("source", ""),
                            "content": doc.page_content[:200] + "..."  # First 200 chars of content
                        } 
                        for doc in result["source_documents"]
                    ]
                }

            return {"status": "News articles processed successfully"}
            
        except Exception as e:
            logger.error(f"Error processing news: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing news: {str(e)}")

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
        
def fetch_stock_performance():
    stock_performance = {}

    for symbol in NIFTY500_SYMBOLS:
        try:
            stock_data = yf.Ticker(symbol).history(period='1d')
            if stock_data.empty:
                logger.warning(f"No data for stock {symbol}. Skipping.")
                continue

            stock_info = yf.Ticker(symbol).info
            company_name = stock_info.get('longName', symbol)
            current_price = float(stock_data['Close'].iloc[-1])
            change_pct = ((stock_data['Close'].iloc[-1] - stock_data['Open'].iloc[0]) / 
                          stock_data['Open'].iloc[0]) * 100
            volume = int(stock_data['Volume'].iloc[-1])

            stock_performance[symbol] = {
                'name': company_name,
                'price': current_price,
                'change_percentage': float(change_pct),
                'volume': volume
            }
        except Exception as e:
            logger.error(f"Error fetching data for stock {symbol}: {str(e)}")
            continue

    return stock_performance

def fetch_sector_performance():
    sector_performance = {}

    for sector_name, symbol in NIFTY_SECTORS.items():
        try:
            sector_data = yf.Ticker(symbol).history(period='5d')
            if not sector_data.empty:
                start_price = float(sector_data['Close'].iloc[0])
                end_price = float(sector_data['Close'].iloc[-1])
                change_pct = ((end_price - start_price) / start_price) * 100
                sector_performance[sector_name] = float(change_pct)
        except Exception as e:
            logger.error(f"Error fetching data for sector {sector_name}: {str(e)}")
            continue
    
    return sector_performance

def generate_market_analysis(sector_performance, stock_performance):
    try:
        top_sector = max(sector_performance, key=sector_performance.get)
        worst_sector = min(sector_performance, key=sector_performance.get)
        top_stock = max(stock_performance, key=lambda x: stock_performance[x]['change_percentage'])
        worst_stock = min(stock_performance, key=lambda x: stock_performance[x]['change_percentage'])

        analysis = (
            f"Today, the top-performing sector is {top_sector} with a change of {sector_performance[top_sector]:.2f}%. "
            f"The sector facing the most challenges is {worst_sector} with a change of {sector_performance[worst_sector]:.2f}%. "
            f"Among stocks, {stock_performance[top_stock]['name']} showed the highest gain of {stock_performance[top_stock]['change_percentage']:.2f}%. "
            f"On the other hand, {stock_performance[worst_stock]['name']} faced the largest decline of {stock_performance[worst_stock]['change_percentage']:.2f}%."
        )
        return analysis
    except Exception as e:
        logger.error(f"Error generating market analysis: {str(e)}")
        return "Unable to generate market analysis due to incomplete data."

def create_market_overview_chart(sector_performance):
    try:
        if not sector_performance:
            return None

        sectors = list(sector_performance.keys())
        changes = list(sector_performance.values())

        fig = go.Figure(
            data=[go.Bar(x=sectors, y=changes, marker_color=['green' if x > 0 else 'red' for x in changes])]
        )

        fig.update_layout(
            title="Sector Performance Overview",
            xaxis_title="Sector",
            yaxis_title="Percentage Change",
            template="plotly_white"
        )

        return fig
    except Exception as e:
        logger.error(f"Error creating market overview chart: {str(e)}")
        return None

@app.get("/market-insights", response_model=MarketOverview)
async def get_market_insights():
    try:
        sector_performance = fetch_sector_performance()
        stock_performance = fetch_stock_performance()

        if not sector_performance or not stock_performance:
            raise HTTPException(
                status_code=500,
                detail="No market data available. Please try again later."
            )

        top_sectors = dict(sorted(sector_performance.items(), key=lambda x: x[1], reverse=True)[:5])
        bottom_sectors = dict(sorted(sector_performance.items(), key=lambda x: x[1])[:5])

        sorted_stocks = sorted(stock_performance.items(), key=lambda x: x[1]['change_percentage'], reverse=True)
        top_gainers = dict(sorted_stocks[:5])
        top_losers = dict(sorted_stocks[-5:])

        market_analysis = generate_market_analysis(sector_performance, stock_performance)
        market_chart = create_market_overview_chart(sector_performance)
        chart_json = market_chart.to_json() if market_chart else None

        return {
            "timestamp": datetime.now().isoformat(),
            "market_overview": {
                "top_performing_sectors": top_sectors,
                "underperforming_sectors": bottom_sectors,
                "top_gainers": top_gainers,
                "top_losers": top_losers,
                "trending_stocks": dict(sorted(stock_performance.items(), key=lambda x: x[1]['volume'], reverse=True)[:5])
            },
            "market_analysis": market_analysis,
            "market_visualization": chart_json,
            "metadata": {
                "data_delay": "15 minutes",
                "disclaimer": "For educational and informational purposes only. Not financial advice.",
                "data_source": "Yahoo Finance",
                "market": "Indian Equity Market"
            }
        }
    except Exception as e:
        logger.error(f"Error in /market-insights endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Error fetching market insights", "message": str(e)}
        )


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

if __name__ == "__main__":
    is_render = os.environ.get('IS_RENDER', False)
    
    if is_render:
        port = int(os.environ.get("PORT", 10000))
        uvicorn.run(
            app,  
            host="0.0.0.0",
            port=port,
            workers=1,  
            log_level="info",
            timeout_keep_alive=30,
            loop="auto"
        )
    else:
        uvicorn.run(
            app,  
            host="127.0.0.1",
            port=8000,
            reload=True
        )
