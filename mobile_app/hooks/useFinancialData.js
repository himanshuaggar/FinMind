import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useFinancialData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('financialData');
      if (savedData) {
        setData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFinancialData = async (newData) => {
    try {
      await AsyncStorage.setItem('financialData', JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Error saving financial data:', error);
    }
  };

  return { data, loading, saveFinancialData };
}
