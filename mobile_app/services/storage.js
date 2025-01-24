import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PORTFOLIO: 'portfolio',
  WATCHLIST: 'watchlist',
  GOALS: 'goals',
  MARKET_SENTIMENT: 'market_sentiment',
};

export const storage = {
  async get(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return null;
    }
  },

  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
      throw error;
    }
  },

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      throw error;
    }
  },

  KEYS: STORAGE_KEYS
};