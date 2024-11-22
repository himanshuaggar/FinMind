import axios from 'axios';
import { API_URL, API_ENDPOINTS } from '../constants/api';

const api = axios.create({
  baseURL: API_URL,
});

export const analyzeNews = async (urls: string[], query?: string) => {
  const response = await api.post(API_ENDPOINTS.NEWS_ANALYSIS, { urls, query });
  return response.data;
};

export const analyzeFinancialReports = async (files: FormData, query?: string) => {
  const response = await api.post(API_ENDPOINTS.FINANCIAL_REPORTS, files, {
    params: { query },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const chatWithAdvisor = async (financialData: any, query: string) => {
  const response = await api.post(API_ENDPOINTS.CHAT, { financial_data: financialData, query });
  return response.data;
};

export const analyzeStock = async (symbol: string) => {
  const response = await api.post(API_ENDPOINTS.STOCK_ANALYSIS, { symbol });
  return response.data;
};

export const getMarketOverview = async () => {
  const response = await axios.get('https://finnhub.io/api/v1/quote/market', {
    params: {
      token: process.env.FINNHUB_API_KEY
    }
  });
  return response.data;
};

export const getPortfolioData = async (userId: string) => {
  const response = await api.get(`${API_ENDPOINTS.PORTFOLIO}/${userId}`);
  return response.data;
};

export const getWatchlistData = async (userId: string) => {
  const response = await api.get(`${API_ENDPOINTS.WATCHLIST}/${userId}`);
  return response.data;
};

export const getMarketSentiment = async () => {
  const response = await axios.get('https://www.alphavantage.co/query', {
    params: {
      function: 'NEWS_SENTIMENT',
      apikey: process.env.ALPHA_VANTAGE_API_KEY
    }
  });
  return response.data;
};

export const getUserGoals = async (userId: string) => {
  const response = await api.get(`${API_ENDPOINTS.GOALS}/${userId}`);
  return response.data;
};

export const updateUserGoals = async (userId: string, goals: any) => {
  const response = await api.put(`${API_ENDPOINTS.GOALS}/${userId}`, { goals });
  return response.data;
};
