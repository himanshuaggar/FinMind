import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { getMarketOverview } from "../../services/api";
import Loading from "../common/Loading";
import { COLORS, SIZES } from "../../constants/theme";

interface MarketData {
  name: string;
  value: number;
  change: number;
}

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMarketOverview();
      
      // Check if we're using mock data
      setIsUsingMockData(
        data.nifty.value === 19500 && 
        data.sensex.value === 65400 && 
        data.bankNifty.value === 44800
      );

      const formattedData = [
        { 
          name: "NIFTY 50", 
          value: data.nifty.value || 0, 
          change: data.nifty.change || 0
        },
        { 
          name: "SENSEX", 
          value: data.sensex.value || 0, 
          change: data.sensex.change || 0
        },
        { 
          name: "BANK NIFTY", 
          value: data.bankNifty.value || 0, 
          change: data.bankNifty.change || 0
        },
      ];
      setMarketData(formattedData);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Unable to load market data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number): string => {
    try {
      return value.toLocaleString('en-IN', {
        maximumFractionDigits: 2
      });
    } catch (error) {
      return '0.00';
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Overview</Text>
        {isUsingMockData && (
          <Text style={styles.mockDataBadge}>Demo Data</Text>
        )}
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {marketData.map((index, i) => (
          <View key={i} style={styles.indexCard}>
            <Text style={styles.indexName}>{index.name}</Text>
            <Text style={styles.indexValue}>
              {formatNumber(index.value)}
            </Text>
            <Text 
              style={[
                styles.indexChange,
                { color: index.change >= 0 ? COLORS.success : COLORS.error }
              ]}
            >
              {index.change >= 0 ? '+' : ''}{index.change?.toFixed(2) || '0.00'}%
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  scrollView: {
    flexDirection: "row",
  },
  indexCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    marginRight: SIZES.small,
    width: 150,
  },
  indexName: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xSmall,
  },
  indexValue: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.xSmall,
  },
  indexChange: {
    fontSize: SIZES.small,
    fontWeight: "bold",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.medium,
  },
  mockDataBadge: {
    fontSize: SIZES.small,
    color: COLORS.warning,
    backgroundColor: `${COLORS.warning}20`,
    paddingHorizontal: SIZES.small,
    paddingVertical: 2,
    borderRadius: SIZES.small,
  }
});
