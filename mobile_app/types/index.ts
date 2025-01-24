declare global {
    namespace ReactNavigation {
        interface RootParamList {
            onboarding: undefined;
            "(tabs)": undefined;
            error: undefined;
            modal: {
                title?: string;
            };
        }
    }
}
export interface AnalysisResponse {
    result?: string;
    sources?: Array<{
      page: number;
      source: string;
      [key: string]: any;
    }>;
    status?: string;
    error?: string;
  }

export interface FinancialData {
    income: number;
    expenses: {
        Housing: number;
        Food: number;
        Transportation: number;
        Utilities: number;
        Entertainment: number;
        Other: number;
    };
    savings: number;
    investments: {
        Stocks: number;
        'Mutual Funds': number;
        'Fixed Deposits': number;
        'Real Estate': number;
        Other: number;
    };
    debts: {
        'Home Loan': number;
        'Car Loan': number;
        'Personal Loan': number;
        'Credit Card': number;
        'Other Debts': number;
    };
    goals: string[];
}

export interface StockData {
    symbol: string;
    latest_price: number;
    historical_data: {
        date: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    }[];
    fundamentals: {
        PE_Ratio: number;
        EPS: number;
        Market_Cap: number;
        Dividend_Yield: number;
        Revenue: number;
        Profit_Margin: number;
        Debt_to_Equity: number;
        ROE: number;
    };
    recommendation: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export interface NewsAnalysisResult {
    result: string;
    sources: {
        source: string;
        title: string;
        url: string;
    }[];
}

export interface ReportAnalysisResult {
    result: string;
    sources: {
        filename: string;
        page: number;
    }[];
}

export interface Portfolio {
    totalValue: number;
    todayGain: number;
    totalGain: number;
    holdings: {
        symbol: string;
        shares: number;
        avgPrice: number;
        currentPrice: number;
        previousClose?: number;
    }[];
    historicalData: {
        date: string;
        value: number;
    }[];
}

export interface WatchlistItem {
    symbol: string;
    name: string;
    price?: number;
    change?: number;
    addedAt?: string;
    lastUpdated?: string;
}

export interface Goal {
    id: string;
    name: string;
    target: number;
    current: number;
    deadline?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MarketSentiment {
    overall: number;
    bullish: number;
    bearish: number;
    indicators: {
        name: string;
        value: number;
        signal: 'bullish' | 'bearish' | 'neutral';
    }[];
    lastUpdated: string;
}

export interface MarketQuote {
    symbol: string;
    price: number;
    previousClose: number;
    change: number;
    changePercent: number;
}
