import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_ENDPOINTS, EXTERNAL_APIS } from '../constants/api';
import { storage } from './storage';
import { Portfolio, WatchlistItem, Goal, MarketSentiment } from '../types';
import { NEWS_CACHE_TIME } from '../constants/config';
import { NewsItem, NewsCategory } from '../types/news';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    try {
      // Add auth token if available
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await AsyncStorage.removeItem('authToken');
      // Redirect to login
    }
    return Promise.reject(error);
  }
);

// Wrapper function for API calls with error handling
const apiCall = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await api[method](endpoint, data, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`API Error (${endpoint}):`, {
        status: error.response?.status,
        message: error.response?.data?.detail || error.message,
      });
      throw new Error(error.response?.data?.detail || 'Network error occurred');
    }
    throw error;
  }
};

// Update your API functions to use the wrapper
export const analyzeNews = async (urls: string[], query?: string) => {
  return apiCall('/api/analyze-news', 'post', { urls, query });
};

export const analyzeFinancialReports = async (files: FormData, query?: string) => {
  const response = await api.post(API_ENDPOINTS.FINANCIAL_REPORTS, files, {
    params: { query },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log(response.data);
  return response.data;
};

export const chatWithAdvisor = async (financialData: FinancialData, query: string) => {
  try {
    // Calculate metrics before sending
    const totalExpenses = Object.values(financialData.expenses).reduce((a, b) => a + b, 0);
    const totalInvestments = Object.values(financialData.investments).reduce((a, b) => a + b, 0);
    const totalDebts = Object.values(financialData.debts).reduce((a, b) => a + b, 0);
    const monthlySavings = financialData.income - totalExpenses;

    // Format the request data with calculated values
    const formattedData = {
      financial_data: {
        income: Number(financialData.income) || 0,
        expenses: Object.fromEntries(
          Object.entries(financialData.expenses).map(([key, value]) => [key, Number(value) || 0])
        ),
        savings: Number(monthlySavings) || 0,
        investments: Object.fromEntries(
          Object.entries(financialData.investments).map(([key, value]) => [key, Number(value) || 0])
        ),
        debts: Object.fromEntries(
          Object.entries(financialData.debts).map(([key, value]) => [key, Number(value) || 0])
        ),
        goals: Array.isArray(financialData.goals) ? financialData.goals : []
      },
      query: query.trim()
    };

    // Validate the data before sending
    if (!isValidFinancialData(formattedData.financial_data)) {
      throw new Error('Please ensure all financial values are valid numbers');
    }

    const response = await apiCall<{ response: string }>(
      'post',
      API_ENDPOINTS.CHAT,
      formattedData
    );

    return response.response;
  } catch (error) {
    console.error('Error in chatWithAdvisor:', error);
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      throw new Error('Invalid financial data format. Please check your inputs.');
    }
    throw error;
  }
};

// Helper function to validate financial data
function isValidFinancialData(data: any): boolean {
  // Check if income is a valid number
  if (typeof data.income !== 'number' || isNaN(data.income)) {
    return false;
  }

  // Check if savings is a valid number
  if (typeof data.savings !== 'number' || isNaN(data.savings)) {
    return false;
  }

  // Check expenses object
  if (!isValidNumberObject(data.expenses)) {
    return false;
  }

  // Check investments object
  if (!isValidNumberObject(data.investments)) {
    return false;
  }

  // Check debts object
  if (!isValidNumberObject(data.debts)) {
    return false;
  }

  // Check goals array
  if (!Array.isArray(data.goals)) {
    return false;
  }

  return true;
}

// Helper function to validate objects with number values
function isValidNumberObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  return Object.values(obj).every(
    value => typeof value === 'number' && !isNaN(value)
  );
}

export const analyzeStock = async (symbol: string) => {
  const response = await api.post(API_ENDPOINTS.STOCK_ANALYSIS, { symbol });
  console.log(response.data);
  return response.data;
};

export const getMarketOverview = async () => {
  try {
    // Try to get cached data first
    const cachedData = await storage.get('marketOverview');
    const cacheTime = await storage.get('marketOverviewTime');

    // Use cache if it's less than 5 minutes old
    if (cachedData && cacheTime && (Date.now() - Number(cacheTime)) < 300000) {
      return cachedData;
    }

    // Default mock data (will be used if API fails)
    const defaultData = {
      nifty: {
        value: 19500,
        change: 0.75
      },
      sensex: {
        value: 65400,
        change: 0.82
      },
      bankNifty: {
        value: 44800,
        change: 0.93
      }
    };

    const formatIndexData = (response: any) => {
      try {
        if (!response?.data?.chart?.result?.[0]?.meta) {
          throw new Error('Invalid response structure');
        }

        const meta = response.data.chart.result[0].meta;
        const currentPrice = meta.regularMarketPrice || 0;
        const previousClose = meta.previousClose || currentPrice;

        return {
          value: currentPrice,
          change: previousClose ? parseFloat(((currentPrice - previousClose) / previousClose * 100).toFixed(2)) : 0
        };
      } catch (error) {
        console.error('Error formatting index data:', error);
        return null;
      }
    };

    // Fetch data for all three indices
    const indices = await Promise.all([
      axios.get('https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI'),
      axios.get('https://query1.finance.yahoo.com/v8/finance/chart/%5EBSESN'),
      axios.get('https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEBANK')
    ]).catch(error => {
      console.error('Error fetching indices:', error);
      return null;
    });

    if (!indices) {
      console.warn('Using default market data due to API error');
      return defaultData;
    }

    const [niftyResponse, sensexResponse, bankNiftyResponse] = indices;

    const marketData = {
      nifty: formatIndexData(niftyResponse) || defaultData.nifty,
      sensex: formatIndexData(sensexResponse) || defaultData.sensex,
      bankNifty: formatIndexData(bankNiftyResponse) || defaultData.bankNifty
    };

    // Cache the new data
    await storage.set('marketOverview', marketData);
    await storage.set('marketOverviewTime', Date.now().toString());

    return marketData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    // Return mock data if everything fails
    return {
      nifty: {
        value: 19500,
        change: 0.75
      },
      sensex: {
        value: 65400,
        change: 0.82
      },
      bankNifty: {
        value: 44800,
        change: 0.93
      }
    };
  }
};

export const getUserGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const goals = await storage.get<Goal[]>('goals') || [];
    return goals;
  } catch (error) {
    console.error('Error in getUserGoals:', error);
    throw error;
  }
};

export const updateUserGoals = async (userId: string, goals: Goal[]): Promise<Goal[]> => {
  try {
    await storage.set('goals', goals);
    return goals;
  } catch (error) {
    console.error('Error in updateUserGoals:', error);
    throw error;
  }
};

export const getMarketSentiment = async (): Promise<MarketSentiment> => {
  try {
    // Try to get cached data first
    const cachedData = await storage.get<MarketSentiment>('market_sentiment');
    const cacheTime = await storage.get('market_sentiment_time');

    // Use cache if it's less than 15 minutes old
    if (cachedData && cacheTime && (Date.now() - Number(cacheTime)) < 900000) {
      return cachedData;
    }

    // Get market data from Yahoo Finance
    const [niftyResponse, newsResponse] = await Promise.all([
      axios.get('https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI', {
        params: {
          interval: '1d',
          range: '30d',
          includePrePost: false
        }
      }),
      axios.get('https://query1.finance.yahoo.com/v6/finance/news/NSEI')
    ]).catch(error => {
      console.error('Error fetching market data:', error);
      throw new Error('Failed to fetch market data');
    });

    // Calculate technical indicators from price data
    const prices = niftyResponse.data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
    const technicalScore = calculateTechnicalIndicators(prices);

    // Calculate sentiment from recent price movements
    const recentPrices = prices.slice(-5);
    const priceMovement = recentPrices.length > 1 ?
      (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0] * 100 : 0;

    const bullishSignals = [
      technicalScore > 50,
      priceMovement > 0,
      prices[prices.length - 1] > calculateSMA(prices, 20)
    ].filter(Boolean).length;

    const totalSignals = 3;
    const sentimentScore = (bullishSignals / totalSignals) * 100;

    const sentiment: MarketSentiment = {
      overall: parseFloat(sentimentScore.toFixed(2)),
      bullish: parseFloat((sentimentScore).toFixed(2)),
      bearish: parseFloat((100 - sentimentScore).toFixed(2)),
      indicators: [
        {
          name: 'Technical Analysis',
          value: technicalScore,
          signal: determineSignal(technicalScore)
        },
        {
          name: 'Price Movement',
          value: parseFloat(((priceMovement + 100) / 2).toFixed(2)),
          signal: priceMovement > 0 ? 'bullish' : 'bearish'
        },
        {
          name: 'Moving Average',
          value: prices[prices.length - 1] > calculateSMA(prices, 20) ? 75 : 25,
          signal: prices[prices.length - 1] > calculateSMA(prices, 20) ? 'bullish' : 'bearish'
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    // Cache the new sentiment data
    await storage.set('market_sentiment', sentiment);
    await storage.set('market_sentiment_time', Date.now().toString());

    return sentiment;
  } catch (error) {
    console.error('Error in getMarketSentiment:', error);

    // Return cached data if available
    const cachedSentiment = await storage.get<MarketSentiment>('market_sentiment');
    if (cachedSentiment) {
      return cachedSentiment;
    }

    // Return mock data if everything fails
    return {
      overall: 55,
      bullish: 55,
      bearish: 45,
      indicators: [
        {
          name: 'Technical Analysis',
          value: 58,
          signal: 'bullish'
        },
        {
          name: 'Price Movement',
          value: 52,
          signal: 'neutral'
        },
        {
          name: 'Moving Average',
          value: 55,
          signal: 'bullish'
        }
      ],
      lastUpdated: new Date().toISOString()
    };
  }
};

// Helper function to calculate technical indicators
function calculateTechnicalIndicators(prices: number[]): number {
  if (!prices || prices.length < 20) return 50;

  const sma20 = calculateSMA(prices.slice(-20), 20);
  const sma50 = calculateSMA(prices.slice(-50), 50);
  const currentPrice = prices[prices.length - 1];

  const bullishSignals = [
    currentPrice > sma20,
    currentPrice > sma50,
    prices[prices.length - 1] > calculateSMA(prices, 20)
  ].filter(Boolean).length;

  const totalSignals = 3;
  const technicalScore = (bullishSignals / totalSignals) * 100;

  return technicalScore;
}

// Helper functions for sentiment calculation
function calculateOverallSentiment(newsSentiment: any, technicalAnalysis: any): number {
  // Implement your sentiment calculation logic here
  return (newsSentiment.sentiment * 0.6 + calculateTechnicalScore(technicalAnalysis) * 0.4);
}

function calculateTechnicalScore(technicalAnalysis: any): number {
  // Implement your technical analysis score calculation here
  return 0.5; // Placeholder
}

function determineSignal(value: number): 'bullish' | 'bearish' | 'neutral' {
  if (value > 0.6) return 'bullish';
  if (value < 0.4) return 'bearish';
  return 'neutral';
}

// Add helper functions for technical analysis
function calculateSMA(prices: number[], period: number): number {
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateRSI(prices: number[], period: number): number {
  // Implement RSI calculation
  return 50; // Placeholder
}

function calculateMACD(prices: number[]): number {
  // Implement MACD calculation
  return 0; // Placeholder
}

export const getStockChartData = async (symbol: string, range: '1D' | '1W' | '1M' | '3M' | '1Y' = '1M') => {
  try {
    const formattedSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
    const cacheKey = `chart_${formattedSymbol}_${range}`;

    // Check cache first
    const cachedData = await storage.get(cacheKey);
    const cacheTime = await storage.get(`${cacheKey}_time`);

    // Use cache if it's less than 5 minutes old
    if (cachedData && cacheTime && (Date.now() - Number(cacheTime)) < 300000) {
      return cachedData;
    }

    // Convert range to Yahoo Finance format
    const rangeMap = {
      '1D': '1d',
      '1W': '5d',
      '1M': '1mo',
      '3M': '3mo',
      '1Y': '1y'
    };

    const intervalMap = {
      '1D': '5m',
      '1W': '15m',
      '1M': '1d',
      '3M': '1d',
      '1Y': '1d'
    };

    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}`, {
      params: {
        interval: intervalMap[range],
        range: rangeMap[range],
        includePrePost: false
      }
    });

    if (!response?.data?.chart?.result?.[0]) {
      throw new Error('Invalid response structure');
    }

    const result = response.data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const meta = result.meta;

    const chartData = {
      symbol: formattedSymbol,
      currentPrice: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      change: parseFloat(((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2)),
      dates: timestamps.map((timestamp: number) => new Date(timestamp * 1000).toISOString()),
      prices: quotes.close,
      volumes: quotes.volume,
      range
    };

    // Cache the data
    await storage.set(cacheKey, chartData);
    await storage.set(`${cacheKey}_time`, Date.now().toString());

    return chartData;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw new Error('Failed to fetch chart data');
  }
};

interface SectorPerformance {
  sector: string;
  performance: number;
}

const YAHOO_FINANCE_API_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

export const getAIInsights = async () => {
  try {
    const [marketNews, sectorPerformance, volatilityData] = await Promise.all([
      fetchMarketNews(),
      fetchSectorPerformance(),
      fetchVolatilityIndex()
    ]);

    const marketTrends = processSectorPerformance(sectorPerformance);
    const topInsights = processMarketInsights(marketNews, volatilityData);
    const tradingVolume = calculateTradingVolume(sectorPerformance);

    return {
      marketSummary: generateMarketSummary(marketTrends, volatilityData, marketNews),
      tradingVolume,
      volatilityIndex: volatilityData.value,
      marketTrends,
      topInsights,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return getMockMarketData();
  }
};

async function fetchMarketNews() {
  try {
    // Using Yahoo Finance API for news
    const response = await axios.get(
      'https://query1.finance.yahoo.com/v1/news/list',
      {
        params: {
          region: 'US',
          snippetCount: 5
        }
      }
    );

    return response.data.items.map((article: any) => ({
      headline: article.title,
      summary: article.summary,
      category: article.category || 'general',
      url: article.link,
      datetime: new Date(article.published_at).getTime()
    }));
  } catch (error) {
    console.error('Error fetching market news:', error);
    return getMockNews();
  }
}

async function fetchSectorPerformance() {
  try {
    // Using Yahoo Finance API for sector performance
    const sectors = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^TNX'];
    const responses = await Promise.all(
      sectors.map(symbol =>
        axios.get(`${YAHOO_FINANCE_API_URL}/${symbol}`, {
          params: {
            interval: '1d',
            range: '1d'
          }
        })
      )
    );

    return responses.map((response, index) => ({
      symbol: sectors[index],
      data: response.data.chart.result[0]
    }));
  } catch (error) {
    console.error('Error fetching sector performance:', error);
    return getMockSectorPerformance();
  }
}

async function fetchVolatilityIndex() {
  try {
    // Using VIX index from Yahoo Finance
    const response = await axios.get(`${YAHOO_FINANCE_API_URL}/%5EVIX`, {
      params: {
        interval: '1d',
        range: '1d'
      }
    });

    const result = response.data.chart.result[0];
    return {
      value: result.meta.regularMarketPrice,
      previousClose: result.meta.previousClose
    };
  } catch (error) {
    console.error('Error fetching volatility index:', error);
    return { value: 15, previousClose: 14.5 };
  }
}

function processSectorPerformance(sectorData: any[]): MarketTrend[] {
  return sectorData.map(sector => {
    const meta = sector.data.meta;
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    const percentage = ((currentPrice - previousClose) / previousClose) * 100;

    return {
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage),
      sector: getSectorName(sector.symbol),
      analysis: generateSectorAnalysis(percentage, sector.symbol)
    };
  });
}

function getSectorName(symbol: string): string {
  const sectorMap: { [key: string]: string } = {
    '^GSPC': 'S&P 500',
    '^DJI': 'Dow Jones',
    '^IXIC': 'NASDAQ',
    '^RUT': 'Russell 2000',
    '^TNX': 'Treasury Yield'
  };
  return sectorMap[symbol] || symbol;
}

function processMarketInsights(marketNews: any[], marketIndicators: any, volatilityData: any) {
  const insights = [];

  // Process market news for insights
  const significantNews = marketNews
    .slice(0, 5)
    .map(news => analyzeNewsImpact(news));

  insights.push(...significantNews);

  // Add volatility insight if significant
  if (volatilityData.value > 20) {
    insights.push({
      category: 'Risk Alert',
      title: 'High Market Volatility',
      description: `VIX at ${volatilityData.value.toFixed(2)} indicates elevated market uncertainty. Consider defensive positioning.`,
      impact: 'negative',
      confidence: 90,
      icon: 'chart-line'
    });
  }

  return insights.slice(0, 3); // Return top 3 insights
}

function generateSectorAnalysis(sector: string, performance: number): string {
  const trend = performance > 0 ? 'gaining' : 'declining';
  const strength = Math.abs(performance) > 2 ? 'strong' : 'moderate';

  const sectorAnalysis = {
    Technology: {
      positive: 'driven by strong earnings and AI developments',
      negative: 'facing pressure from valuation concerns'
    },
    Healthcare: {
      positive: 'benefiting from defensive positioning',
      negative: 'impacted by regulatory concerns'
    },
    Energy: {
      positive: 'supported by rising commodity prices',
      negative: 'affected by demand uncertainty'
    }
  };

  const sectorInfo = sectorAnalysis[sector] || {
    positive: 'showing positive momentum',
    negative: 'experiencing downward pressure'
  };

  return `${sector} is ${trend} with ${strength} momentum, ${performance > 0 ? sectorInfo.positive : sectorInfo.negative
    }`;
}

function analyzeNewsImpact(news: any) {
  const sentiment = analyzeSentiment(news.headline + ' ' + news.summary);

  return {
    category: 'Market News',
    title: news.headline.slice(0, 50) + '...',
    description: news.summary.slice(0, 100) + '...',
    impact: sentiment.score > 0 ? 'positive' : sentiment.score < 0 ? 'negative' : 'neutral',
    confidence: Math.round(Math.abs(sentiment.score) * 100),
    icon: getNewsIcon(news.category)
  };
}

function analyzeSentiment(text: string) {
  const positiveWords = ['growth', 'gain', 'positive', 'surge', 'rise'];
  const negativeWords = ['decline', 'loss', 'negative', 'fall', 'risk'];

  const words = text.toLowerCase().split(' ');
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  const negativeCount = words.filter(word => negativeWords.includes(word)).length;

  const score = (positiveCount - negativeCount) / words.length;
  return { score };
}

function getNewsIcon(category: string): string {
  const iconMap = {
    earnings: 'chart-bar',
    technology: 'microchip',
    economy: 'university',
    general: 'newspaper'
  };
  return iconMap[category] || 'info-circle';
}

function calculateTradingVolume(marketIndicators: any): number {
  return marketIndicators.volume || 125000000;
}

function generateMarketSummary(
  marketTrends: any[],
  volatilityData: any,
  marketNews: any[]
): string {
  const topSectors = marketTrends
    .sort((a, b) => Math.abs(b.percentage) - Math.abs(a.percentage))
    .slice(0, 2);

  const volatilityStatus = volatilityData.value > 20 ? 'elevated' : 'moderate';

  const significantNews = marketNews[0]?.headline || '';

  return `Market showing ${volatilityStatus} volatility (VIX: ${volatilityData.value.toFixed(1)}). ${topSectors[0].sector
    } leads ${topSectors[0].direction === 'up' ? 'gains' : 'losses'} at ${topSectors[0].percentage.toFixed(1)
    }%. ${significantNews}`;
}

export const getLatestAnalysis = async () => {
  try {
    // Check cache first
    const cachedData = await storage.get('latest_analysis');
    const cacheTime = await storage.get('latest_analysis_time');

    if (cachedData && cacheTime && (Date.now() - Number(cacheTime)) < 300000) {
      return cachedData;
    }

    // Fetch data from Alpha Vantage
    const response = await axios.get(EXTERNAL_APIS.ALPHA_VANTAGE, {
      params: {
        function: 'NEWS_SENTIMENT',
        tickers: 'NIFTY,SENSEX',
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });

    const analysis = {
      alerts: generateAlerts(response.data),
      insights: generateInsights(response.data),
      lastUpdated: new Date().toISOString()
    };

    // Cache the data
    await storage.set('latest_analysis', analysis);
    await storage.set('latest_analysis_time', Date.now().toString());

    return analysis;
  } catch (error) {
    console.error('Error in getLatestAnalysis:', error);
    return getMockLatestAnalysis();
  }
};

// Helper functions
function calculateVolatility(marketData: any): number {
  try {
    const changes = marketData?.[0]?.quotes?.map(
      (quote: any) => quote.regularMarketChangePercent
    ) || [];
    const avg = changes.reduce((a: number, b: number) => a + b, 0) / changes.length;
    const variance = changes.reduce((a: number, b: number) => a + Math.pow(b - avg, 2), 0) / changes.length;
    return Math.sqrt(variance);
  } catch (error) {
    return 1.5; // Default moderate volatility
  }
}

function generateAlerts(newsData: any): any[] {
  try {
    return (newsData?.feed || [])
      .slice(0, 3)
      .map((item: any) => ({
        title: item.title,
        description: item.summary,
        priority: determinePriority(item.overall_sentiment_score),
        timestamp: new Date(item.time_published).toISOString()
      }));
  } catch (error) {
    return getMockAlerts();
  }
}

function determinePriority(sentimentScore: number): string {
  if (sentimentScore >= 0.5) return 'high';
  if (sentimentScore >= 0) return 'medium';
  return 'low';
}

function getMockLatestAnalysis() {
  return {
    alerts: getMockAlerts(),
    insights: getMockInsights(),
    lastUpdated: new Date().toISOString()
  };
}

function getMockAlerts() {
  return [
    {
      title: 'Market Movement Alert',
      description: 'Significant movement detected in technology sector',
      priority: 'high',
      timestamp: new Date().toISOString()
    },
    {
      title: 'Economic Update',
      description: 'RBI policy meeting scheduled next week',
      priority: 'medium',
      timestamp: new Date().toISOString()
    },
    {
      title: 'Sector Update',
      description: 'Banking sector showing strong momentum',
      priority: 'low',
      timestamp: new Date().toISOString()
    }
  ];
}

function getMockInsights() {
  return [
    {
      category: 'Market Analysis',
      title: 'Technology Sector Overview',
      description: 'Tech stocks showing resilience amid market volatility',
      icon: 'microchip',
      timestamp: new Date().toISOString()
    },
    {
      category: 'Economic Outlook',
      title: 'GDP Growth Forecast',
      description: 'Analysts project strong economic growth',
      icon: 'chart-line',
      timestamp: new Date().toISOString()
    },
    {
      category: 'Sector Analysis',
      title: 'Banking Sector Update',
      description: 'Banking stocks lead market rally',
      icon: 'university',
      timestamp: new Date().toISOString()
    }
  ];
}

function getMockNews() {
  return [
    {
      headline: 'Markets Rally on Economic Data',
      summary: 'Stock markets show strong gains as economic indicators exceed expectations.',
      category: 'general',
      url: '#',
      datetime: Date.now()
    },
    {
      headline: 'Tech Sector Leads Market Gains',
      summary: 'Technology stocks continue to drive market momentum with strong earnings reports.',
      category: 'technology',
      url: '#',
      datetime: Date.now()
    },
    {
      headline: 'Federal Reserve Policy Update',
      summary: 'Fed signals continued focus on price stability while monitoring economic growth.',
      category: 'economy',
      url: '#',
      datetime: Date.now()
    }
  ];
}

function getMockMarketData() {
  return {
    marketSummary: "Markets showing mixed signals with technology sector leading gains.",
    tradingVolume: 125000000,
    volatilityIndex: 15.7,
    marketTrends: [
      {
        direction: 'up',
        percentage: 2.3,
        sector: 'Technology',
        analysis: 'Strong earnings and AI developments driving growth'
      },
      {
        direction: 'down',
        percentage: 1.1,
        sector: 'Energy',
        analysis: 'Oil price volatility affecting sector performance'
      }
    ],
    topInsights: getMockInsights(),
    lastUpdated: new Date().toISOString()
  };
}

function generateInsights(newsData: any): any[] {
  try {
    return (newsData?.feed || [])
      .slice(0, 3)
      .map((item: any) => ({
        category: 'Market Analysis',
        title: item.title || 'Market Update',
        description: item.summary || item.description || 'Market analysis update',
        icon: getNewsIcon(item.category || 'general'),
        timestamp: new Date(item.time_published || Date.now()).toISOString()
      }));
  } catch (error) {
    console.error('Error generating insights:', error);
    return getMockInsights();
  }
}

function getMockMarketIndicators() {
  return {
    marketStatus: 'open',
    volume: 125000000,
    indices: [
      {
        symbol: '^GSPC',
        price: 4185.82,
        volume: 42000000,
        change: 35.88,
        changePercent: 0.85
      },
      {
        symbol: '^DJI',
        price: 32945.84,
        volume: 38000000,
        change: 171.32,
        changePercent: 0.52
      },
      {
        symbol: '^IXIC',
        price: 14284.34,
        volume: 45000000,
        change: 181.74,
        changePercent: 1.28
      }
    ]
  };
}

// Cache key constants
const NEWS_CACHE_KEY = 'news_cache_';
const NEWS_LAST_FETCH_KEY = 'news_last_fetch_';
const API_CALL_COUNT_KEY = 'news_api_calls_';

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';

// Consolidated mock data functions
const getMockData = {
  news: (category: NewsCategory = 'all'): NewsItem[] => {
    return [
      {
        id: '1',
        title: 'Market Update: Global Markets Show Resilience',
        description: 'Major indices demonstrate strength amid economic challenges',
        imageUrl: 'https://example.com/market-image.jpg',
        source: 'Financial Times',
        url: 'https://example.com/market-update',
        publishedAt: new Date().toISOString(),
        category: 'business',
        content: 'Detailed market analysis...'
      },
      {
        id: '2',
        title: 'Tech Sector Leads Market Rally',
        description: 'Technology companies show strong performance in latest trading session',
        imageUrl: 'https://example.com/tech-image.jpg',
        source: 'Bloomberg',
        url: 'https://example.com/tech-rally',
        publishedAt: new Date().toISOString(),
        category: 'technology',
        content: 'Technology sector analysis...'
      },
      {
        id: '3',
        title: 'Federal Reserve Announces Policy Decision',
        description: 'Central bank maintains current monetary policy stance',
        imageUrl: 'https://example.com/fed-image.jpg',
        source: 'Reuters',
        url: 'https://example.com/fed-policy',
        publishedAt: new Date().toISOString(),
        category: 'business',
        content: 'Federal Reserve policy analysis...'
      }
    ];
  },
  marketIndicators: () => {
    return {
      marketStatus: 'open',
      volume: 125000000,
      indices: [
        {
          symbol: '^GSPC',
          price: 4185.82,
          volume: 42000000,
          change: 35.88,
          changePercent: 0.85
        },
        {
          symbol: '^DJI',
          price: 32945.84,
          volume: 38000000,
          change: 171.32,
          changePercent: 0.52
        },
        {
          symbol: '^IXIC',
          price: 14284.34,
          volume: 45000000,
          change: 181.74,
          changePercent: 1.28
        }
      ]
    };
  }
};

const NEWS_API_KEY = "25989c6cfcc8415d9a8f10121bc11e36";

export const getNews = async (category: NewsCategory = 'all'): Promise<NewsItem[]> => {
  try {
    // Check cache first
    // const cacheKey = `news_${category}`;
    // const cachedData = await storage.get(cacheKey);
    // const cacheTime = await storage.get(`${cacheKey}_time`);

    // // Use cache if it's less than 15 minutes old
    // if (cachedData && cacheTime && (Date.now() - Number(cacheTime)) < 90) {
    //   return JSON.parse(cachedData);
    // }

    let endpoint = `${NEWSAPI_BASE_URL}/top-headlines`;
    let params: any = {
      country: 'us',
      apiKey: NEWS_API_KEY,
      category:'business'
    };

    // if (category !== 'all') {
    //   params.category = category;
    // }
    console.log(endpoint)
    console.log(params)

    const response = await axios.get(endpoint, { params });
    console.log(response)

    const newsItems = response.data.articles.map((article: any, index: number) => ({
      id: `${article.publishedAt}-${index}`,
      title: article.title,
      description: article.description,
      imageUrl: article.urlToImage,
      source: article.source.name,
      url: article.url,
      publishedAt: article.publishedAt,
      category: category,
      content: article.content
    }));

    // // Cache the data
    // await storage.set(cacheKey, JSON.stringify(newsItems));
    // await storage.set(`${cacheKey}_time`, Date.now().toString());

    return newsItems;
  } catch (error) {
    console.error('Error fetching news:', error);
    return getMockData.news(category);
  }
};
