import AsyncStorage from '@react-native-async-storage/async-storage';

export class CacheService {
  static instance = null;

  constructor() {
    this.defaultConfig = {
      expirationMinutes: 5
    };
  }

  static getInstance() {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async set(key, data, config) {
    try {
      const cacheConfig = { ...this.defaultConfig, ...config };
      const cacheData = {
        data,
        timestamp: Date.now(),
        expirationMinutes: cacheConfig.expirationMinutes
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async get(key) {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp, expirationMinutes } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > expirationMinutes * 60 * 1000;

      if (isExpired) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async clear(key) {
    try {
      if (key) {
        await AsyncStorage.removeItem(key);
      } else {
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export const cacheService = CacheService.getInstance();