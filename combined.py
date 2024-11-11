import os
import streamlit as st
import time
import yfinance as yf
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.document_loaders import UnstructuredURLLoader, PyPDFLoader
from langchain.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import matplotlib.pyplot as plt
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Verify API key is loaded
if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

# Configure Google Generative AI
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Initialize the LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    temperature=0.7,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

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
    """
    
    try:
        response = llm.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating advice: {str(e)}"

# Function to create financial overview chart
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

# Stock Analysis Functions
def fetch_latest_price(symbol):
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period="1d")
        latest_price = data['Close'][0]
        return latest_price
    except Exception as e:
        st.error(f"Error fetching data for {symbol}: {e}")
        return None

def fetch_historical_data(symbol, period="1mo"):
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period=period)
        return data
    except Exception as e:
        st.error(f"Error fetching historical data for {symbol}: {e}")
        return None

def fetch_fundamentals(symbol):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        
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
        st.error(f"Error fetching fundamentals for {symbol}: {e}")
        return None

def generate_stock_recommendation(fundamentals):
    recommendation = "Neutral"
    
    pe_ratio = fundamentals.get('PE Ratio', 'N/A')
    if pe_ratio != 'N/A':
        if pe_ratio > 25:
            recommendation = "Overvalued, Consider Selling"
        elif pe_ratio < 15:
            recommendation = "Undervalued, Consider Buying"
    
    dividend_yield = fundamentals.get('Dividend Yield', 'N/A')
    if dividend_yield != 'N/A':
        if dividend_yield < 0.02:
            recommendation = "Low Dividend Yield, Hold or Sell"
        elif dividend_yield > 0.05:
            recommendation = "High Dividend Yield, Good for Income, Hold"
    
    debt_to_equity = fundamentals.get('Debt-to-Equity Ratio', 'N/A')
    if debt_to_equity != 'N/A':
        if debt_to_equity > 1:
            recommendation = "High Debt, Riskier, Avoid or Sell"
        elif debt_to_equity < 0.5:
            recommendation = "Low Debt, Low Risk, Good for Long-Term Hold"
    
    return_on_equity = fundamentals.get('Return on Equity', 'N/A')
    if return_on_equity != 'N/A':
        if return_on_equity < 0:
            recommendation = "Negative ROE, Risky, Avoid"
        elif return_on_equity > 15:
            recommendation = "Strong ROE, Hold or Buy"
    
    profit_margin = fundamentals.get('Profit Margin', 'N/A')
    if profit_margin != 'N/A':
        if profit_margin < 0:
            recommendation = "Negative Profit Margin, Avoid"
        elif profit_margin > 0.2:
            recommendation = "High Profit Margin, Good Financial Health"
    
    return recommendation

def generate_detailed_advice(symbol):
    historical_data_week = fetch_historical_data(symbol, period="5d")
    historical_data_month = fetch_historical_data(symbol, period="1mo")
    historical_data_6months = fetch_historical_data(symbol, period="6mo")
    historical_data_year = fetch_historical_data(symbol, period="1y")
    historical_data_5years = fetch_historical_data(symbol, period="5y")
    
    week_price_end = month_price_end = six_months_price_end = year_price_end = five_year_price_end = "Data Not Available"
    week_change = month_change = six_months_change = year_change = five_year_change = "Data Not Available"

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
    
    fundamentals = fetch_fundamentals(symbol)
    
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

# Streamlit UI
st.set_page_config(page_title="Financial Advisory Chatbot", layout="wide")
st.title("💰 Financial Advisory Chatbot & Research Assistant")

# Sidebar for financial data input
with st.sidebar:
    st.header("📊 Your Financial Information")
    
    # Income input
    st.session_state.financial_data['income'] = st.number_input(
        "Monthly Income (₹)", 
        min_value=0, 
        value=st.session_state.financial_data['income']
    )
    
    # Expenses input
    st.subheader("Monthly Expenses")
    expense_categories = ['Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Other']
    for category in expense_categories:
        st.session_state.financial_data['expenses'][category] = st.number_input(
            f"{category} (₹)",
            min_value=0,
            value=st.session_state.financial_data['expenses'].get(category, 0)
        )
    
    # Investments input
    st.subheader("Investments")
    investment_categories = ['Stocks', 'Mutual Funds', 'Fixed Deposits', 'Real Estate', 'Others']
    for category in investment_categories:
        st.session_state.financial_data['investments'][category] = st.number_input(
            f"{category} (₹)",
            min_value=0,
            value=st.session_state.financial_data['investments'].get(category, 0)
        )
    
    # Debts input
    st.subheader("Debts")
    debt_categories = ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card', 'Other Debts']
    for category in debt_categories:
        st.session_state.financial_data['debts'][category] = st.number_input(
            f"{category} (₹)",
            min_value=0,
            value=st.session_state.financial_data['debts'].get(category, 0)
        )
    
    # Financial goals
    st.subheader("Financial Goals")
    new_goal = st.text_input("Add a financial goal")
    if new_goal and st.button("Add Goal"):
        st.session_state.financial_data['goals'].append(new_goal)
    
    # Display current goals
    if st.session_state.financial_data['goals']:
        st.write("Current Goals:")
        for i, goal in enumerate(st.session_state.financial_data['goals']):
            st.write(f"{i+1}. {goal}")

# Stock Analysis Section
st.sidebar.title("📈 Stock Analysis")
symbol = st.sidebar.text_input("Stock Symbol (e.g., RELIANCE.NS, TATAMOTORS.NS)", "RELIANCE.NS").upper()

if st.sidebar.button("Get Stock Analysis"):
    latest_price = fetch_latest_price(symbol)
    if latest_price:
        st.write(f"**Latest Price for {symbol}:** ₹{latest_price}")

        detailed_advice = generate_detailed_advice(symbol)
        st.subheader("Financial Advice:")
        st.write(detailed_advice)

        historical_data_6months = fetch_historical_data(symbol, period="6mo")
        if historical_data_6months is not None:
            fig, ax = plt.subplots(figsize=(10, 6))
            ax.plot(historical_data_6months.index, historical_data_6months['Close'], label="Close Price", color='blue')
            ax.set_title(f"Price Trend of {symbol} Over the Last 6 Months")
            ax.set_xlabel("Date")
            ax.set_ylabel("Price (₹)")
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
            ax.xaxis.set_major_locator(mdates.MonthLocator())
            plt.xticks(rotation=45)
            plt.tight_layout()
            st.pyplot(fig)

# Main chat interface
st.header("💬 Financial Advisor Chat")

# Calculate metrics
metrics = calculate_financial_metrics(st.session_state.financial_data)

# Display financial overview chart
st.plotly_chart(create_financial_overview_chart(metrics))

# Display key metrics
col1, col2, col3 = st.columns(3)
with col1:
    st.metric("Monthly Savings", f"₹{metrics['monthly_savings']:,.2f}")
with col2:
    st.metric("Debt-to-Income Ratio", f"{metrics['debt_to_income']:.1f}%")
with col3:
    st.metric("Savings Rate", f"{metrics['savings_rate']:.1f}%")

# Chat interface
for message in st.session_state.chat_history:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# User input for financial advice
if prompt := st.chat_input("Ask for financial advice (e.g., 'How can I improve my savings?' or 'Should I invest in stocks?')"):
    st.chat_message("user").markdown(prompt)
    st.session_state.chat_history.append({"role": "user", "content": prompt})
    
    response = generate_financial_advice(metrics, st.session_state.financial_data, prompt)
    st.chat_message("assistant").markdown(response)
    st.session_state.chat_history.append({"role": "assistant", "content": response})

# Document Analysis Section
st.sidebar.title("📄 Document Analysis")
tab1, tab2 = st.sidebar.tabs(["News Articles", "Financial Reports"])

with tab1:
    st.subheader("Add Financial News URLs")
    urls = []
    for i in range(3):
        url = st.text_input(f"Financial News URL {i+1}", 
                          help="Add URLs from financial news sources like Bloomberg, Reuters, etc.")
        urls.append(url)

with tab2:
    st.subheader("Upload Financial Documents")
    uploaded_files = st.file_uploader(
        "Upload company financial reports (PDF)", 
        accept_multiple_files=True,
        help="Upload annual reports, quarterly reports, or other financial documents"
    )

process_clicked = st.sidebar.button("Process Documents")
file_path = "faiss_store_finance"

if process_clicked:
    documents = []
    
    # Process URLs if provided
    if any(urls):
        loader = UnstructuredURLLoader(urls=[url for url in urls if url])
        st.text("Loading news articles...✅")
        documents.extend(loader.load())

    # Process PDFs if uploaded
    if uploaded_files:
        for file in uploaded_files:
            temp_path = f"temp_{file.name}"
            with open(temp_path, "wb") as f:
                f.write(file.getvalue())
            loader = PyPDFLoader(temp_path)
            st.text(f"Processing {file.name}...✅")
            documents.extend(loader.load())
            os.remove(temp_path)

    # Create embeddings and save the FAISS index
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore_finance = FAISS.from_documents(documents, embeddings)
    vectorstore_finance.save_local(file_path)
    st.text("Ready to answer questions about your documents! 🚀")

# Query interface for document analysis
st.sidebar.markdown("## Analysis Type")
analysis_type = st.sidebar.selectbox(
    "Select Analysis Type:",
    [
        "Financial Metrics Analysis",
        "Risk Assessment",
        "Market Trends",
        "Competitive Analysis",
        "Regulatory Compliance",
        "Investment Opportunities",
        "Custom Query"
    ]
)

query = st.text_area("Your Question:", height=150)

if query and os.path.exists(file_path):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = FAISS.load_local(file_path, embeddings, allow_dangerous_deserialization=True)
    
    analysis_prompt = f"You are a financial expert specialized in {analysis_type}. Analyze the provided information and give a detailed response.\n\nContext: {query}\n\nProvide a structured analysis."
    
    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True,
        chain_type_kwargs={"prompt": analysis_prompt}
    )
    
    with st.spinner(f'Performing {analysis_type}...'):
        result = chain({"query": query})
    
    st.header(f"{analysis_type} Results")
    st.markdown(result["result"])
    
    # Display sources
    st.subheader("Sources:")
    sources = set()
    for doc in result["source_documents"]:
        source = doc.metadata.get("source", "")
        if source:
            sources.add(source)
    
    for source in sources:
        st.markdown(f"- {source}")

# Additional information in sidebar
with st.sidebar:
    st.markdown("""### 📝 How to Use
    1. Enter your financial information in the sidebar.
    2. Add your financial goals.
    3. Ask questions about your financial situation.
    4. Get personalized recommendations.
    
    ### 🎯 Example Questions
    - How can I improve my savings?
    - What's the best way to pay off my debts?
    - Should I invest more in mutual funds?
    - How can I achieve my financial goals faster?
    - Is my current investment portfolio balanced?
    """)
