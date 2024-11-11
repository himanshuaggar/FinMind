import os
import streamlit as st
import time
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import pandas as pd
import plotly.graph_objects as go
import json
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import google.generativeai as genai
import yfinance as yf
from fastapi.middleware.cors import CORSMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import UnstructuredURLLoader, PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain.prompts import PromptTemplate

# Configure Gemini API
genai.configure(api_key="AIzaSyDj_aU8gvsjWntoQp5gnC4DLhd9f4pjk7Q")

# Initialize the model
model = genai.GenerativeModel(model_name='gemini-pro',
                            generation_config={
                                'temperature': 0.7,
                                'top_p': 0.8,
                                'max_output_tokens': 2048,
                            })

# Initialize session state variables
if 'financial_data' not in st.session_state:
    st.session_state.financial_data = {
        'income': 0,
        'expenses': {},
        'savings': 0,
        'investments': {},
        'debts': {},
        'goals': []
    }

if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

# Function to calculate financial metrics
def calculate_financial_metrics(data):
    total_expenses = sum(data['expenses'].values())
    total_investments = sum(data['investments'].values())
    total_debts = sum(data['debts'].values())
    monthly_savings = data['income'] - total_expenses
    debt_to_income = (total_debts / data['income'] * 100) if data['income'] > 0 else 0
    savings_rate = (monthly_savings / data['income'] * 100) if data['income'] > 0 else 0
    
    return {
        'total_expenses': total_expenses,
        'total_investments': total_investments,
        'total_debts': total_debts,
        'monthly_savings': monthly_savings,
        'debt_to_income': debt_to_income,
        'savings_rate': savings_rate
    }

# Function to generate financial advice
def generate_financial_advice(metrics, data, query):
    prompt = f"""
    As a personal financial advisor, provide brief, goal-oriented advice for this query:

    User's Financial Goals:
    {json.dumps(data['goals'], indent=2)}

    Current Financial Snapshot:
    - Monthly Income: ₹{data['income']:,}
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

# Function to create visualization
def create_financial_overview_chart(metrics):
    labels = ['Income', 'Expenses', 'Savings', 'Investments', 'Debts']
    values = [
        st.session_state.financial_data['income'],
        metrics['total_expenses'],
        metrics['monthly_savings'],
        metrics['total_investments'],
        metrics['total_debts']
    ]
    
    fig = go.Figure(data=[go.Bar(
        x=labels,
        y=values,
        marker_color=['#2ecc71', '#e74c3c', '#3498db', '#f1c40f', '#e67e22']
    )])
    
    fig.update_layout(
        title='Financial Overview',
        xaxis_title='Category',
        yaxis_title='Amount (₹)',
        template='plotly_white'
    )
    
    return fig

# Function to fetch the latest stock price
def fetch_latest_price(symbol):
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period="1d")
        latest_price = data['Close'][0]
        return latest_price
    except Exception as e:
        return None

# Function to fetch historical data (last 10 days for trend analysis)
def fetch_historical_data(symbol, period="1mo"):
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period=period)
        return data
    except Exception as e:
        return None

# Function to fetch company fundamentals
def fetch_fundamentals(symbol):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        
        # Extract relevant fundamentals
        fundamentals = {
            "PE Ratio": info.get("trailingPE", "N/A"),
            "EPS": info.get("epsTrailingTwelveMonths", "N/A"),
            "Market Cap": info.get("marketCap", "N/A"),
            "Dividend Yield": info.get("dividendYield", "N/A"),
            "Revenue": info.get("totalRevenue", "N/A"),
            "Profit Margin": info.get("profitMargins", "N/A"),
            "Debt-to-Equity Ratio": info.get("debtToEquity", "N/A"),
            "Return on Equity": info.get("returnOnEquity", "N/A")
        }
        return fundamentals
    except Exception as e:
        return None

# Function to generate stock recommendation based on fundamentals
def generate_stock_recommendation(fundamentals):
    recommendation = "Neutral"
    
    # Price-to-Earnings (PE) Ratio
    pe_ratio = fundamentals.get('PE Ratio', 'N/A')
    if pe_ratio != 'N/A':
        if pe_ratio > 25:
            recommendation = "Overvalued, Consider Selling"
        elif pe_ratio < 15:
            recommendation = "Undervalued, Consider Buying"
    
    # Dividend Yield
    dividend_yield = fundamentals.get('Dividend Yield', 'N/A')
    if dividend_yield != 'N/A':
        if dividend_yield < 0.02:
            recommendation = "Low Dividend Yield, Hold or Sell"
        elif dividend_yield > 0.05:
            recommendation = "High Dividend Yield, Good for Income, Hold"
    
    # Debt-to-Equity Ratio
    debt_to_equity = fundamentals.get('Debt-to-Equity Ratio', 'N/A')
    if debt_to_equity != 'N/A':
        if debt_to_equity > 1:
            recommendation = "High Debt, Riskier, Avoid or Sell"
        elif debt_to_equity < 0.5:
            recommendation = "Low Debt, Low Risk, Good for Long-Term Hold"
    
    # Return on Equity (ROE)
    return_on_equity = fundamentals.get('Return on Equity', 'N/A')
    if return_on_equity != 'N/A':
        if return_on_equity < 0:
            recommendation = "Negative ROE, Risky, Avoid"
        elif return_on_equity > 15:
            recommendation = "Strong ROE, Hold or Buy"
    
    # Profit Margin
    profit_margin = fundamentals.get('Profit Margin', 'N/A')
    if profit_margin != 'N/A':
        if profit_margin < 0:
            recommendation = "Negative Profit Margin, Avoid"
        elif profit_margin > 0.2:
            recommendation = "High Profit Margin, Good Financial Health"
    
    return recommendation

# Function to generate detailed advice
def generate_detailed_advice(symbol):
    # Fetching historical data for various time periods
    historical_data_week = fetch_historical_data(symbol, period="5d")
    historical_data_month = fetch_historical_data(symbol, period="1mo")
    historical_data_6months = fetch_historical_data(symbol, period="6mo")
    historical_data_year = fetch_historical_data(symbol, period="1y")
    historical_data_5years = fetch_historical_data(symbol, period="5y")
    
    # Default values in case the data is empty or unavailable
    week_price_end = month_price_end = six_months_price_end = year_price_end = five_year_price_end = "Data Not Available"
    week_change = month_change = six_months_change = year_change = five_year_change = "Data Not Available"

    # Check if data exists for each period and assign values
    if historical_data_week is not None and not historical_data_week.empty:
        week_price_start = historical_data_week['Close'].iloc[0]
        week_price_end = historical_data_week['Close'].iloc[-1]
        week_change = ((week_price_end - week_price_start) / week_price_start) * 100
    
    if historical_data_month is not None and not historical_data_month.empty:
        month_price_start = historical_data_month['Close'].iloc[0]
        month_price_end = historical_data_month['Close'].iloc[-1]
        month_change = ((month_price_end - month_price_start) / month_price_start) * 100
    
    if historical_data_6months is not None and not historical_data_6months.empty:
        six_months_price_start = historical_data_6months['Close'].iloc[0]
        six_months_price_end = historical_data_6months['Close'].iloc[-1]
        six_months_change = ((six_months_price_end - six_months_price_start) / six_months_price_start) * 100
    
    if historical_data_year is not None and not historical_data_year.empty:
        year_price_start = historical_data_year['Close'].iloc[0]
        year_price_end = historical_data_year['Close'].iloc[-1]
        year_change = ((year_price_end - year_price_start) / year_price_start) * 100
    
    if historical_data_5years is not None and not historical_data_5years.empty:
        five_year_price_start = historical_data_5years['Close'].iloc[0]
        five_year_price_end = historical_data_5years['Close'].iloc[-1]
        five_year_change = ((five_year_price_end - five_year_price_start) / five_year_price_start) * 100
    
    # Fetching company fundamentals
    fundamentals = fetch_fundamentals(symbol)
    
    # Return advice with the available data
    advice = f"""
    **1 Week Price Trend:** ₹{week_price_end} (Change: {week_change}%)  
    **1 Month Price Trend:** ₹{month_price_end} (Change: {month_change}%)  
    **6 Months Price Trend:** ₹{six_months_price_end} (Change: {six_months_change}%)  
    **1 Year Price Trend:** ₹{year_price_end} (Change: {year_change}%)  
    **5 Year Price Trend:** ₹{five_year_price_end} (Change: {five_year_change}%)  

    **Fundamental Analysis:**
    - **PE Ratio:** {fundamentals['PE Ratio']}  
    - **EPS (Earnings Per Share):** {fundamentals['EPS']}  
    - **Market Cap:** {fundamentals['Market Cap']}  
    - **Dividend Yield:** {fundamentals['Dividend Yield']}  
    - **Revenue:** {fundamentals['Revenue']}  
    - **Profit Margin:** {fundamentals['Profit Margin']}  
    - **Debt-to-Equity Ratio:** {fundamentals['Debt-to-Equity Ratio']}  
    - **Return on Equity:** {fundamentals['Return on Equity']}  

    **Stock Recommendation:**
    {generate_stock_recommendation(fundamentals)}

    Based on the analysis of the stock's recent trends and its fundamentals, you should consider the company's long-term stability, growth potential, and your own risk tolerance before making any decisions.
    """

    return advice

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # Allow your frontend's origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    temperature=0.7,
    google_api_key="AIzaSyDj_aU8gvsjWntoQp5gnC4DLhd9f4pjk7"
)

# Endpoint to get financial advice
@app.post("/financial-advice")
def get_financial_advice(query: str):
    metrics = calculate_financial_metrics(st.session_state.financial_data)
    advice = generate_financial_advice(metrics, st.session_state.financial_data, query)
    return {"advice": advice}

# Endpoint to get stock recommendation
@app.get("/stock-recommendation/{symbol}")
def get_stock_recommendation(symbol: str):
    latest_price = fetch_latest_price(symbol)
    if latest_price:
        detailed_advice = generate_detailed_advice(symbol)
        return {"latest_price": latest_price, "advice": detailed_advice}
    else:
        return {"error": f"Error fetching data for {symbol}"}

# Endpoint to process documents and URLs
@app.post("/document-analysis")
async def get_document_analysis(urls: list[str] = [], files: list[UploadFile] = File(...)):
    documents = []

    # Process URLs if provided
    if any(urls):
        loader = UnstructuredURLLoader(urls=[url for url in urls if url])
        documents.extend(loader.load())

    # Process PDFs if uploaded
    if files:
        for file in files:
            temp_path = f"temp_{file.filename}"
            with open(temp_path, "wb") as f:
                f.write(file.file.read())
            loader = PyPDFLoader(temp_path)
            documents.extend(loader.load())
            os.remove(temp_path)

    # Create embeddings and save to FAISS
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = FAISS.from_documents(documents, embeddings)

    # Return a success message
    return {"message": "Documents processed successfully!"}

@app.get("/")
async def get_root():
    return HTMLResponse(
        """
        <html>
        <head>
            <title>Financial Advisory Chatbot API</title>
        </head>
        <body>
            <h1>Welcome to the Financial Advisory Chatbot API</h1>
            <p>This API provides the following endpoints:</p>
            <ul>
                <li><a href="/docs">/docs</a> - Interactive API documentation</li>
                <li><a href="/redoc">/redoc</a> - Alternative API documentation</li>
                <li><a href="/financial-advice">/financial-advice</a> - Get financial advice</li>
                <li><a href="/stock-recommendation/{symbol}">/stock-recommendation/{symbol}</a> - Get stock recommendation</li>
                <li><a href="/document-analysis">/document-analysis</a> - Upload documents and get analysis</li>
            </ul>
        </body>
        </html>
        """
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)