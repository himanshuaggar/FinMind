import os
import time
import json
import streamlit as st
import yfinance as yf
import pandas as pd
import plotly.graph_objects as go
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import UnstructuredURLLoader, PyPDFLoader
from langchain.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Verify API key is loaded
if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

# Set the page configuration
st.set_page_config(page_title="Financial Assistant App", layout="wide")

# Sidebar for navigation
st.sidebar.title("Navigation")
page = st.sidebar.radio("Select a Page:", ["Home", "FinanceGPT", "Financial Advisory Chatbot", "Stock Financial Advisor"])

# Home Page
if page == "Home":
    st.title("Welcome to the Financial Assistant App")
    st.write("""
    This application provides various tools to assist you with financial research, advisory, and stock analysis.
    
    - **FinanceGPT**: A financial research assistant that helps you analyze financial documents and news articles.
    - **Financial Advisory Chatbot**: A chatbot that provides personalized financial advice based on your financial data.
    - **Stock Financial Advisor Tool**: A tool to analyze stock performance and provide recommendations based on financial metrics.
    
    Use the sidebar to navigate to the desired feature.
    """)

# FinanceGPT Page
elif page == "FinanceGPT":
    st.title("FinanceGPT: Financial Research Assistant 📈")
    st.sidebar.title("Document Sources")

    # Add tabs for different input types
    tab1, tab2 = st.tabs(["News Articles", "Financial Reports"])

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

    # Initialize the LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-pro",
        temperature=0.7,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

    # Create a finance-focused prompt template
    template = """You are a financial analyst expert. Use the following information to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.

    When analyzing financial data:
    - Provide specific numbers and metrics when available
    - Compare with industry standards if relevant
    - Highlight key risks and opportunities
    - Consider both quantitative and qualitative factors

    Context: {context}

    Question: {question}

    Detailed Analysis:"""

    PROMPT = PromptTemplate(
        template=template,
        input_variables=["context", "question"]
    )

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

        # Split documents
        text_splitter = RecursiveCharacterTextSplitter(
            separators=['\n\n', '\n', '.', ','],
            chunk_size=1000
        )
        st.text("Processing documents...✅")
        docs = text_splitter.split_documents(documents)

        # Create embeddings
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vectorstore_finance = FAISS.from_documents(docs, embeddings)
        st.text("Creating knowledge base...✅")
        time.sleep(2)

        # Save the FAISS index
        vectorstore_finance.save_local(file_path)
        st.text("Ready to answer questions about your documents! 🚀")

    # Update the query types and templates section
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

    # Enhanced query templates for each analysis type
    query_templates = {
        "Financial Metrics Analysis": {
            "template": """Analyze the following financial metrics:
            1. Revenue and Growth
            2. Profit Margins
            3. ROE and ROA
            4. Debt-to-Equity Ratio
            5. Working Capital
            Please provide specific numbers and year-over-year comparisons."""
        },
        "Risk Assessment": {
            "template": """Identify and analyze:
            1. Key Business Risks
            2. Market Risks
            3. Financial Risks
            4. Operational Risks
            5. Regulatory Risks
            Provide specific examples and potential impact assessments."""
        },
        "Market Trends": {
            "template": """Analyze the following market aspects:
            1. Industry Growth Trends
            2. Market Share Analysis
            3. Consumer Behavior Shifts
            4. Technology Impact
            5. Future Market Projections
            Include specific data points and market statistics."""
        },
        "Competitive Analysis": {
            "template": """Provide analysis of:
            1. Major Competitors
            2. Market Position
            3. Competitive Advantages
            4. Market Share Comparison
            5. Strategic Initiatives
            Include specific competitor comparisons and market data."""
        },
        "Regulatory Compliance": {
            "template": """Evaluate:
            1. Current Compliance Status
            2. Regulatory Requirements
            3. Recent/Upcoming Regulatory Changes
            4. Compliance Costs
            5. Potential Regulatory Risks
            Highlight specific regulations and their impact."""
        },
        "Investment Opportunities": {
            "template": """Analyze:
            1. Growth Potential
            2. Investment Risks
            3. Valuation Metrics
            4. Market Opportunity
            5. Strategic Advantages
            Provide specific investment metrics and potential returns."""
        },
        "Custom Query": {
            "template": ""
        }
    }

    # Create a more detailed prompt template based on analysis type
    def get_analysis_prompt(analysis_type):
        base_template = """You are a financial expert specialized in {analysis_type}. 
        Analyze the provided information and give a detailed response.
        
        When analyzing, consider:
        {specific_considerations}
        
        Context: {context}
        Question: {question}
        
        Provide a structured analysis with:
        1. Key Findings
        2. Detailed Analysis
        3. Supporting Data
        4. Recommendations
        """
        
        specific_considerations = {
            "Financial Metrics Analysis": """
            - Revenue trends and growth rates
            - Profitability metrics (Gross margin, Operating margin, Net margin)
            - Return metrics (ROE, ROA, ROIC)
            - Liquidity ratios
            - Cash flow analysis""",
            
            "Risk Assessment": """
            - Market risks and volatility
            - Operational risks
            - Financial risks
            - Strategic risks
            - External risk factors""",
            
            "Market Trends": """
            - Industry growth patterns
            - Market share dynamics
            - Consumer behavior shifts
            - Technological disruptions
            - Competitive landscape changes""",
            
            "Competitive Analysis": """
            - Market position
            - Competitive advantages
            - Peer comparison
            - Strategic initiatives
            - Market share analysis""",
            
            "Regulatory Compliance": """
            - Current regulatory status
            - Upcoming regulatory changes
            - Compliance costs
            - Industry standards
            - Risk mitigation measures""",
            
            "Investment Opportunities": """
            - Growth potential
            - Valuation metrics
            - Risk-return profile
            - Market opportunities
            - Investment timeline"""
        }
        
        return PromptTemplate(
            template=base_template,
            input_variables=["context", "question"],
            partial_variables={
                "analysis_type": analysis_type,
                "specific_considerations": specific_considerations.get(analysis_type, "")
            }
        )

    # Update the query interface
    if analysis_type == "Custom Query":
        query = st.text_input(
            "Your Question:",
            value="",
            help="Ask specific questions about the documents"
        )
    else:
        query = st.text_area(
            "Your Question:",
            value=query_templates[analysis_type]["template"],
            height=150,
            help="Ask specific questions about the documents or use the template provided"
        )

    if query:
        if os.path.exists(file_path):
            embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
            vectorstore = FAISS.load_local(
                file_path, 
                embeddings,
                allow_dangerous_deserialization=True
            )
            
            # Use the specific prompt for the selected analysis type
            analysis_prompt = get_analysis_prompt(analysis_type)
            
            chain = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=vectorstore.as_retriever(),
                return_source_documents=True,
                chain_type_kwargs={"prompt": analysis_prompt}
            )
            
            with st.spinner(f'Performing {analysis_type}...'):
                result = chain({"query": query})
            
            # Display the analysis with better formatting
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

# Financial Advisory Chatbot Page
elif page == "Financial Advisory Chatbot":
    import google.generativeai as genai

    # Configure Gemini API
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

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

    # Streamlit UI
    st.title("💰 Financial Advisory Chatbot")

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
        with st.sidebar:
            st.markdown("""
            ### 📝 How to Use
            1. Enter your financial information in the sidebar
            2. Add your financial goals
            3. Ask questions about your financial situation
            4. Get personalized recommendations
            
            ### 🎯 Example Questions
            - How can I improve my savings?
            - What's the best way to pay off my debts?
            - Should I invest more in mutual funds?
            - How can I achieve my financial goals faster?
            - Is my current investment portfolio balanced?
            """)
        
        # Display current goals
        if st.session_state.financial_data['goals']:
            st.write("Current Goals:")
            for i, goal in enumerate(st.session_state.financial_data['goals']):
                st.write(f"{i+1}. {goal}")

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

    # User input
    if prompt := st.chat_input("Ask for financial advice (e.g., 'How can I improve my savings?' or 'Should I invest in stocks?')"):
        # Display user message
        st.chat_message("user").markdown(prompt)
        st.session_state.chat_history.append({"role": "user", "content": prompt})
        
        # Generate and display response
        with st.chat_message("assistant"):
            response = generate_financial_advice(metrics, st.session_state.financial_data, prompt)
            st.markdown(response)
            st.session_state.chat_history.append({"role": "assistant", "content": response})

# Stock Financial Advisor Tool Page
elif page == "Stock Financial Advisor":
    st.title("Stock Financial Advisor")
    st.sidebar.title("Enter Stock Symbol")

    # User input for stock symbol (for NSE use .NS for Indian stocks like RELIANCE.NS)
    symbol = st.sidebar.text_input("Stock Symbol (e.g., RELIANCE.NS, TATAMOTORS.NS)", "RELIANCE.NS").upper()

    # Function to fetch the latest stock price
    def fetch_latest_price(symbol):
        try:
            stock = yf.Ticker(symbol)
            data = stock.history(period="1d")
            latest_price = data['Close'][0]
            return latest_price
        except Exception as e:
            st.error(f"Error fetching data for {symbol}: {e}")
            return None

    # Function to fetch historical data (last 10 days for trend analysis)
    def fetch_historical_data(symbol, period="1mo"):
        try:
            stock = yf.Ticker(symbol)
            data = stock.history(period=period)
            return data
        except Exception as e:
            st.error(f"Error fetching historical data for {symbol}: {e}")
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
            st.error(f"Error fetching fundamentals for {symbol}: {e}")
            return None

    # Function to generate stock recommendation based on fundamentals
    def generate_stock_recommendation(fundamentals, current_price, previous_price, trend_change):
        recommendation = "Neutral"
        reasons = []

        # Price-to-Earnings (PE) Ratio
        pe_ratio = fundamentals.get('PE Ratio', 'N/A')
        if pe_ratio != 'N/A':
            if pe_ratio > 25:
                recommendation = "Overvalued, Consider Selling"
                reasons.append(f"The current PE ratio of {pe_ratio} suggests that the stock is overvalued compared to industry standards.")
            elif pe_ratio < 15:
                recommendation = "Undervalued, Consider Buying"
                reasons.append(f"The current PE ratio of {pe_ratio} indicates that the stock is undervalued, presenting a potential buying opportunity.")

        # Dividend Yield
        dividend_yield = fundamentals.get('Dividend Yield', 'N/A')
        if dividend_yield != 'N/A':
            if dividend_yield < 0.02:
                recommendation = "Low Dividend Yield, Hold or Sell"
                reasons.append(f"With a dividend yield of {dividend_yield:.2%}, the stock offers low returns on dividends, suggesting a hold or sell strategy.")
            elif dividend_yield > 0.05:
                recommendation = "High Dividend Yield, Good for Income, Hold"
                reasons.append(f"A dividend yield of {dividend_yield:.2%} indicates a strong income potential, making it a good hold for income-focused investors.")

        # Debt-to-Equity Ratio
        debt_to_equity = fundamentals.get('Debt-to-Equity Ratio', 'N/A')
        if debt_to_equity != 'N/A':
            if debt_to_equity > 1:
                recommendation = "High Debt, Riskier, Avoid or Sell"
                reasons.append(f"The debt-to-equity ratio of {debt_to_equity} suggests high leverage, which increases financial risk.")
            elif debt_to_equity < 0.5:
                recommendation = "Low Debt, Low Risk, Good for Long-Term Hold"
                reasons.append(f"With a debt-to-equity ratio of {debt_to_equity}, the company is in a strong financial position with low risk.")

        # Return on Equity (ROE)
        return_on_equity = fundamentals.get('Return on Equity', 'N/A')
        if return_on_equity != 'N/A':
            if return_on_equity < 0:
                recommendation = "Negative ROE, Risky, Avoid"
                reasons.append("The negative return on equity indicates that the company is not generating profit from its equity, which is a red flag.")
            elif return_on_equity > 15:
                recommendation = "Strong ROE, Hold or Buy"
                reasons.append(f"An ROE of {return_on_equity}% reflects strong profitability, suggesting a buy or hold position.")

        # Profit Margin
        profit_margin = fundamentals.get('Profit Margin', 'N/A')
        if profit_margin != 'N/A':
            if profit_margin < 0:
                recommendation = "Negative Profit Margin, Avoid"
                reasons.append("A negative profit margin indicates that the company is losing money on its sales, which is concerning.")
            elif profit_margin > 0.2:
                recommendation = "High Profit Margin, Good Financial Health"
                reasons.append(f"A profit margin of {profit_margin:.2%} suggests strong financial health and effective cost management.")

        # Current Price vs Previous Price
        if current_price and previous_price:
            price_change = ((current_price - previous_price) / previous_price) * 100
            if price_change > 5:
                recommendation += " - Recent price increase indicates positive market sentiment, consider holding."
                reasons.append(f"The stock has increased by {price_change:.2f}%, reflecting positive investor sentiment.")
            elif price_change < -5:
                recommendation += " - Recent price drop may indicate negative sentiment, consider selling or reassessing."
                reasons.append(f"The stock has decreased by {price_change:.2f}%, which may suggest negative market sentiment.")

        # Trend Analysis
        if trend_change > 0:
            recommendation += " - Positive trend observed, may indicate growth potential."
            reasons.append("The positive trend indicates potential growth, making it a favorable investment.")
        elif trend_change < 0:
            recommendation += " - Negative trend observed, caution is advised."
            reasons.append("The negative trend suggests caution, as it may indicate underlying issues with the company.")

        # Final Recommendation
        detailed_recommendation = f"{recommendation}. " + " ".join(reasons)
        return detailed_recommendation

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
        {generate_stock_recommendation(fundamentals, fetch_latest_price(symbol), historical_data_6months['Close'].iloc[-2] if not historical_data_6months.empty else None, (historical_data_6months['Close'].iloc[-1] - historical_data_6months['Close'].iloc[0]) / historical_data_6months['Close'].iloc[0] * 100)}

        Based on the analysis of the stock's recent trends and its fundamentals, you should consider the company's long-term stability, growth potential, and your own risk tolerance before making any decisions.
        """

        return advice

    # Function to plot interactive stock price chart
    def plot_stock_price(symbol):
        # Fetch historical data for the last 5 years
        historical_data_5years = fetch_historical_data(symbol, period="5y")
        
        if historical_data_5years is not None and not historical_data_5years.empty:
            # Create a line chart
            fig = go.Figure()

            # Add a line for the closing price
            fig.add_trace(go.Scatter(
                x=historical_data_5years.index,
                y=historical_data_5years['Close'],
                mode='lines',
                name='Close Price',
                line=dict(color='blue', width=2)
            ))

            # Add a line for the opening price
            fig.add_trace(go.Scatter(
                x=historical_data_5years.index,
                y=historical_data_5years['Open'],
                mode='lines',
                name='Open Price',
                line=dict(color='orange', width=1, dash='dash')
            ))

            # Add a line for the high price
            fig.add_trace(go.Scatter(
                x=historical_data_5years.index,
                y=historical_data_5years['High'],
                mode='lines',
                name='High Price',
                line=dict(color='green', width=1, dash='dash')
            ))

            # Add a line for the low price
            fig.add_trace(go.Scatter(
                x=historical_data_5years.index,
                y=historical_data_5years['Low'],
                mode='lines',
                name='Low Price',
                line=dict(color='red', width=1, dash='dash')
            ))

            # Update layout for better visuals
            fig.update_layout(
                title=f"{symbol} Stock Price Over the Last 5 Years",
                xaxis_title="Date",
                yaxis_title="Price (₹)",
                xaxis_rangeslider_visible=True,
                template='plotly_white',
                hovermode='x unified'
            )

            # Show the figure in Streamlit
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.error(f"No historical data available for {symbol}.")

    # Display the detailed advice for the user
    if st.sidebar.button("Get Detailed Advice"):
        # Fetch the latest price
        latest_price = fetch_latest_price(symbol)
        if latest_price:
            st.write(f"**Latest Price for {symbol}:** ₹{latest_price}")

            # Generate and display detailed financial advice
            detailed_advice = generate_detailed_advice(symbol)
            st.subheader("Financial Advice:")
            st.write(detailed_advice)

            # Plot interactive stock price chart
            plot_stock_price(symbol)