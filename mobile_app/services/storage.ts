import AsyncStorage from '@react-native-async-storage/async-storage';
import { Portfolio, WatchlistItem, Goal, MarketSentiment } from '../types';

const STORAGE_KEYS = {
  PORTFOLIO: 'portfolio',
  WATCHLIST: 'watchlist',
  GOALS: 'goals',
  MARKET_SENTIMENT: 'market_sentiment',
};

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  },
};
