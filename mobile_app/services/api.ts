import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_ENDPOINTS, EXTERNAL_APIS } from '../constants/api';
import { storage } from './storage';
import { Portfolio, WatchlistItem, Goal, MarketSentiment } from '../types';

// Update API_URL based on platform


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

export const chatWithAdvisor = async (financialData: any, query: string) => {
  const response = await api.post(API_ENDPOINTS.CHAT, { financial_data: financialData, query });
  
  console.log(response.data);
  return response.data;
};

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

export const getPortfolioData = async (userId: string): Promise<Portfolio> => {
  try {
    // Try to get cached data first
    const cachedData = await storage.get<Portfolio>('portfolio');
    const cacheTime = await storage.get('portfolioTime');
    
    // Use cache if it's less than 5 minutes old
    if (cachedData && cacheTime && (Date.now() - Number(cacheTime)) < 300000) {
      return cachedData;
    }

    // Get stored portfolio or initialize with defaults
    let portfolio = cachedData || {
      totalValue: 0,
      todayGain: 0,
      totalGain: 0,
      holdings: [
        { symbol: 'RELIANCE.NS', shares: 10, avgPrice: 2500, currentPrice: 2500 },
        { symbol: 'TCS.NS', shares: 5, avgPrice: 3500, currentPrice: 3500 },
        { symbol: 'HDFCBANK.NS', shares: 15, avgPrice: 1600, currentPrice: 1600 }
      ],
      historicalData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        value: 100000 + Math.random() * 10000
      }))
    };

    // Update current prices for holdings using Yahoo Finance
    if (portfolio.holdings.length > 0) {
      const updatedHoldings = await Promise.all(
        portfolio.holdings.map(async (holding) => {
          try {
            const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${holding.symbol}`, {
              params: {
                interval: '1d',
                range: '1d',
                includePrePost: false
              }
            });

            if (!response?.data?.chart?.result?.[0]?.meta) {
              throw new Error('Invalid response structure');
            }

            const meta = response.data.chart.result[0].meta;
            const currentPrice = meta.regularMarketPrice || holding.currentPrice;
            const previousClose = meta.previousClose || currentPrice;

            return {
              ...holding,
              currentPrice,
              previousClose
            };
          } catch (error) {
            console.error(`Error updating price for ${holding.symbol}:`, error);
            return holding;
          }
        })
      );

      // Calculate portfolio values
      const previousTotal = portfolio.totalValue || 0;
      const newTotalValue = updatedHoldings.reduce(
        (sum, holding) => sum + (holding.shares * holding.currentPrice),
        0
      );
      
      // Calculate gains
      const todayGain = previousTotal > 0 
        ? ((newTotalValue - previousTotal) / previousTotal) * 100 
        : 0;

      const totalInvestment = updatedHoldings.reduce(
        (sum, holding) => sum + (holding.shares * holding.avgPrice),
        0
      );

      const totalGain = totalInvestment > 0 
        ? ((newTotalValue - totalInvestment) / totalInvestment) * 100 
        : 0;

      // Update portfolio
      portfolio = {
        ...portfolio,
        holdings: updatedHoldings,
        totalValue: newTotalValue,
        todayGain: parseFloat(todayGain.toFixed(2)),
        totalGain: parseFloat(totalGain.toFixed(2)),
        historicalData: [
          ...portfolio.historicalData,
          {
            date: new Date().toISOString(),
            value: newTotalValue
          }
        ].slice(-365) // Keep last year's data
      };

      // Cache the updated portfolio
      await storage.set('portfolio', portfolio);
      await storage.set('portfolioTime', Date.now().toString());
    }

    return portfolio;
  } catch (error) {
    console.error('Error in getPortfolioData:', error);
    
    // Return cached data if available
    const cachedPortfolio = await storage.get<Portfolio>('portfolio');
    if (cachedPortfolio) {
      return cachedPortfolio;
    }

    // Return mock data if everything fails
    return {
      totalValue: 100000,
      todayGain: 1.25,
      totalGain: 15.75,
      holdings: [
        { 
          symbol: 'RELIANCE.NS', 
          shares: 10, 
          avgPrice: 2500,
          currentPrice: 2450.75
        },
        { 
          symbol: 'TCS.NS', 
          shares: 5, 
          avgPrice: 3500,
          currentPrice: 3580.50
        },
        { 
          symbol: 'HDFCBANK.NS', 
          shares: 15, 
          avgPrice: 1600,
          currentPrice: 1675.25
        }
      ],
      historicalData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        value: 100000 + Math.random() * 10000
      }))
    };
  }
};

export const getWatchlistData = async (userId: string): Promise<WatchlistItem[]> => {
  try {
    // Get stored watchlist or initialize with default stocks
    let watchlist = await storage.get<WatchlistItem[]>('watchlist');
    
    if (!watchlist) {
      watchlist = [
        { 
          symbol: 'RELIANCE.NS',
          name: 'Reliance Industries',
          addedAt: new Date().toISOString()
        },
        { 
          symbol: 'TCS.NS',
          name: 'Tata Consultancy Services',
          addedAt: new Date().toISOString()
        },
        { 
          symbol: 'HDFCBANK.NS',
          name: 'HDFC Bank',
          addedAt: new Date().toISOString()
        }
      ];
      await storage.set('watchlist', watchlist);
    }

    // Get current prices using Yahoo Finance API
    const updatedWatchlist = await Promise.all(
      watchlist.map(async (item) => {
        try {
          // Check if we have cached data that's less than 5 minutes old
          const cacheKey = `stock_${item.symbol}`;
          const cachedData = await storage.get(cacheKey);
          const cacheTime = await storage.get(`${cacheKey}_time`);
          
          if (cachedData && cacheTime && (Date.now() - Number(cacheTime)) < 300000) {
            return cachedData;
          }

          const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${item.symbol}`, {
            params: {
              interval: '1d',
              range: '1d',
              includePrePost: false
            }
          });

          if (!response?.data?.chart?.result?.[0]?.meta) {
            throw new Error('Invalid response structure');
          }

          const meta = response.data.chart.result[0].meta;
          const currentPrice = meta.regularMarketPrice || 0;
          const previousClose = meta.previousClose || currentPrice;
          const priceChange = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;

          const updatedStock = {
            ...item,
            price: currentPrice,
            change: parseFloat(priceChange.toFixed(2))
          };

          // Cache the stock data
          await storage.set(cacheKey, updatedStock);
          await storage.set(`${cacheKey}_time`, Date.now().toString());

          return updatedStock;
        } catch (error) {
          console.error(`Error fetching data for ${item.symbol}:`, error);
          // Try to get cached data if API call fails
          const cachedStock = await storage.get(`stock_${item.symbol}`);
          if (cachedStock) {
            return cachedStock;
          }
          // Return item with mock data if no cache exists
          return {
            ...item,
            price: item.symbol === 'RELIANCE.NS' ? 2450.75 :
                   item.symbol === 'TCS.NS' ? 3580.50 : 1675.25,
            change: item.symbol === 'RELIANCE.NS' ? 1.25 :
                    item.symbol === 'TCS.NS' ? -0.45 : 0.85
          };
        }
      })
    );

    // Cache the updated watchlist
    await storage.set('watchlist', updatedWatchlist);
    
    return updatedWatchlist;
  } catch (error) {
    console.error('Error in getWatchlistData:', error);
    
    // Return stored data without prices if API fails
    const storedWatchlist = await storage.get<WatchlistItem[]>('watchlist');
    if (storedWatchlist) {
      return storedWatchlist;
    }
    
    // Return default data with mock prices if nothing is stored
    return [
      { 
        symbol: 'RELIANCE.NS', 
        name: 'Reliance Industries',
        price: 2450.75,
        change: 1.25
      },
      { 
        symbol: 'TCS.NS', 
        name: 'Tata Consultancy Services',
        price: 3580.50,
        change: -0.45
      },
      { 
        symbol: 'HDFCBANK.NS', 
        name: 'HDFC Bank',
        price: 1675.25,
        change: 0.85
      }
    ];
  }
};

// Add a helper function to format the stock data
const formatStockData = (yahooData: any): {
  price: number;
  change: number;
} => {
  const quote = yahooData.chart.result[0];
  const meta = quote.meta;
  
  return {
    price: meta.regularMarketPrice,
    change: parseFloat(((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2))
  };
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
function calculateNewsSentiment(newsItems: any[]): number {
  // Calculate sentiment score from news items
  const sentimentScores = newsItems.map(item => 
    item.overall_sentiment_score || 0.5
  );
  
  return sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
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

