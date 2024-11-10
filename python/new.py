import yfinance as yf
import pandas as pd
import streamlit as st
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

st.title("Indian Stock Financial Advisor Tool")
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
def fetch_historical_data(symbol, period="10d"):
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

        # Plot price trend for last 6 months
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
