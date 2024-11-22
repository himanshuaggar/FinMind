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

export interface FinancialData {
    income: number;
    expenses: Record<string, number>;
    investments: Record<string, number>;
    debts: Record<string, number>;
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
