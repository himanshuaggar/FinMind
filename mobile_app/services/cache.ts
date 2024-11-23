import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheConfig {
  expirationMinutes: number;
}

export class CacheService {
  private static instance: CacheService;
  private defaultConfig: CacheConfig = {
    expirationMinutes: 5
  };

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async set(key: string, data: any, config?: Partial<CacheConfig>) {
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

  async get(key: string): Promise<any | null> {
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

  async clear(key?: string) {
    try {
      if (key) {
        await AsyncStorage.removeItem(key);
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export const cacheService = CacheService.getInstance();
