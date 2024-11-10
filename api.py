from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Union
from pydantic import BaseModel

app = FastAPI(title="Indian Stock Financial Advisor API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_latest_price(symbol: str) -> Optional[float]:
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period="1d")
        if data.empty:
            return None
        latest_price = float(data['Close'].iloc[-1])
        return latest_price
    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
        return None

def fetch_historical_data(symbol: str, period: str = "10d") -> Optional[pd.DataFrame]:
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period=period)
        return data if not data.empty else None
    except Exception as e:
        print(f"Error fetching historical data for {symbol}: {e}")
        return None

def fetch_fundamentals(symbol: str) -> Optional[Dict[str, Union[float, str]]]:
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
        print(f"Error fetching fundamentals for {symbol}: {e}")
        return None

def generate_stock_recommendation(fundamentals: Dict[str, Any]) -> str:
    if not fundamentals:
        return "Unable to generate recommendation due to missing data"

    pe_ratio = fundamentals.get('PE Ratio')
    dividend_yield = fundamentals.get('Dividend Yield')
    debt_to_equity = fundamentals.get('Debt-to-Equity Ratio')
    return_on_equity = fundamentals.get('Return on Equity')
    profit_margin = fundamentals.get('Profit Margin')

    # Convert string 'N/A' to None for proper comparison
    pe_ratio = None if pe_ratio == 'N/A' else pe_ratio
    dividend_yield = None if dividend_yield == 'N/A' else dividend_yield
    debt_to_equity = None if debt_to_equity == 'N/A' else debt_to_equity
    return_on_equity = None if return_on_equity == 'N/A' else return_on_equity
    profit_margin = None if profit_margin == 'N/A' else profit_margin

    if pe_ratio is not None:
        if float(pe_ratio) > 25:
            return "Overvalued, Consider Selling"
        elif float(pe_ratio) < 15:
            return "Undervalued, Consider Buying"
    
    if dividend_yield is not None:
        if float(dividend_yield) < 0.02:
            return "Low Dividend Yield, Hold or Sell"
        elif float(dividend_yield) > 0.05:
            return "High Dividend Yield, Good for Income, Hold"
    
    if debt_to_equity is not None:
        if float(debt_to_equity) > 1:
            return "High Debt, Riskier, Avoid or Sell"
        elif float(debt_to_equity) < 0.5:
            return "Low Debt, Low Risk, Good for Long-Term Hold"
    
    if return_on_equity is not None:
        if float(return_on_equity) < 0:
            return "Negative ROE, Risky, Avoid"
        elif float(return_on_equity) > 15:
            return "Strong ROE, Hold or Buy"
    
    if profit_margin is not None:
        if float(profit_margin) < 0:
            return "Negative Profit Margin, Avoid"
        elif float(profit_margin) > 0.2:
            return "High Profit Margin, Good Financial Health"
    
    return "Neutral"

class StockPrice(BaseModel):
    symbol: str
    latest_price: float

class StockAdvice(BaseModel):
    symbol: str
    latest_price: Optional[float]
    price_trends: Dict[str, Dict[str, Union[float, str]]]
    fundamentals: Dict[str, Union[float, str]]
    recommendation: str
    detailed_advice: str

@app.get("/")
async def root():
    return {"message": "Welcome to Indian Stock Financial Advisor API"}

@app.get("/price/{symbol}", response_model=StockPrice)
async def get_stock_price(symbol: str):
    latest_price = fetch_latest_price(symbol)
    if latest_price is None:
        raise HTTPException(status_code=404, detail=f"Could not fetch price for {symbol}")
    return StockPrice(symbol=symbol, latest_price=latest_price)

@app.get("/advice/{symbol}", response_model=StockAdvice)
async def get_stock_advice(symbol: str):
    latest_price = fetch_latest_price(symbol)
    if latest_price is None:
        raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}")

    periods = {
        "week": "5d",
        "month": "1mo",
        "6months": "6mo",
        "year": "1y",
        "5years": "5y"
    }

    price_trends = {}
    for period_name, period_value in periods.items():
        data = fetch_historical_data(symbol, period=period_value)
        if data is not None and not data.empty:
            start_price = float(data['Close'].iloc[0])
            end_price = float(data['Close'].iloc[-1])
            change = ((end_price - start_price) / start_price) * 100
            price_trends[period_name] = {
                "end_price": end_price,
                "change_percentage": round(change, 2)
            }
        else:
            price_trends[period_name] = {
                "end_price": 0.0,
                "change_percentage": 0.0
            }

    fundamentals = fetch_fundamentals(symbol)
    if fundamentals is None:
        raise HTTPException(status_code=404, detail=f"Could not fetch fundamentals for {symbol}")
    
    recommendation = generate_stock_recommendation(fundamentals)

    detailed_advice = (
        "Based on the analysis of the stock's recent trends and its fundamentals, "
        "you should consider the company's long-term stability, growth potential, "
        "and your own risk tolerance before making any decisions."
    )

    return StockAdvice(
        symbol=symbol,
        latest_price=latest_price,
        price_trends=price_trends,
        fundamentals=fundamentals,
        recommendation=recommendation,
        detailed_advice=detailed_advice
    )

@app.get("/historical/{symbol}")
async def get_historical_data(symbol: str, period: str = "6mo"):
    data = fetch_historical_data(symbol, period=period)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Could not fetch historical data for {symbol}")
    
    return {
        "symbol": symbol,
        "period": period,
        "data": data.to_dict(orient="records")
    }