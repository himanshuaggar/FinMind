import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useStockData(symbol: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  const loadStockData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(`stock_${symbol}`);
      if (cachedData) {
        setData(JSON.parse(cachedData));
      }
      
      const response = await analyzeStock(symbol);
      setData(response);
      await AsyncStorage.setItem(`stock_${symbol}`, JSON.stringify(response));
    } catch (err) {
      setError('Failed to load stock data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: loadStockData };
}
