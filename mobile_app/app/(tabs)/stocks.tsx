import { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, SafeAreaView } from 'react-native';
import StockSearch from '../../components/stocks/StockSearch';
import StockChart from '../../components/stocks/StockChart';
import StockInfo from '../../components/stocks/StockInfo';
import RiskAssessment from '../../components/stocks/RiskAssessment';
import { analyzeStock } from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';
import Loading from '../../components/common/Loading';

export default function Stocks() {
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (symbol: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await analyzeStock(symbol);
      setStockData(data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError('Error fetching stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Stock Analysis</Text>
      <StockSearch onSearch={handleSearch} loading={loading} />
      {loading && <Loading />}
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ScrollView>
          {stockData && (
            <View style={styles.content}>
              <StockChart symbol={stockData.symbol} initialData={stockData.chartData} />
              <StockInfo fundamentals={stockData.fundamentals} />
              {/* <RiskAssessment stockData={stockData} /> */}
              <View style={styles.recommendationContainer}>
                <Text style={styles.recommendationTitle}>Analysis</Text>
                <Text style={styles.recommendationText}>
                  {stockData.recommendation}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    height: "100%",
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    padding: 16,
    textAlign: 'center',
  },
  content: {
    padding: SIZES.medium,
  },
  error: {
    color: COLORS.error,
    padding: SIZES.medium,
    textAlign: 'center',
  },
  recommendationContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    marginTop: SIZES.medium,
  },
  recommendationTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.small,
  },
  recommendationText: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    lineHeight: SIZES.large * 1.2,
  },
});
