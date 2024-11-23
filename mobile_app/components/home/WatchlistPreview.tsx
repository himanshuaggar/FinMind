import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getWatchlistData } from "../../services/api";
import Loading from "../common/Loading";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

interface WatchlistItem {
  symbol: string;
  name: string;
  price?: number;
  change?: number;
}

export default function WatchlistPreview() {
  const router = useRouter();
  const [watchlistData, setWatchlistData] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    fetchWatchlistData();
  }, []);

  const fetchWatchlistData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWatchlistData('');
      
      // Check if we're using mock data
      setIsUsingMockData(
        data.some(item => 
          (item.symbol === 'RELIANCE.NS' && item.price === 2450.75) ||
          (item.symbol === 'TCS.NS' && item.price === 3580.50) ||
          (item.symbol === 'HDFCBANK.NS' && item.price === 1675.25)
        )
      );
      
      setWatchlistData(data);
    } catch (error) {
      console.error('Error fetching watchlist data:', error);
      setError('Unable to load watchlist data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '---';
    return `₹${price.toLocaleString('en-IN', { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 2 
    })}`;
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWatchlistData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Watchlist</Text>
        {isUsingMockData && (
          <Text style={styles.mockDataBadge}>Demo Data</Text>
        )}
        <TouchableOpacity onPress={() => router.push("/watchlist")}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {watchlistData.length === 0 ? (
        <Text style={styles.emptyText}>No stocks in watchlist</Text>
      ) : (
        <ScrollView style={styles.stockList}>
          {watchlistData.map((stock, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.stockCard}
              onPress={() => router.push(`/stocks/${stock.symbol}`)}
            >
              <View style={styles.stockInfo}>
                <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                <Text style={styles.stockName}>{stock.name || 'Loading...'}</Text>
              </View>
              <View style={styles.priceInfo}>
                <Text style={styles.stockPrice}>
                  {formatPrice(stock.price)}
                </Text>
                {stock.change !== undefined && (
                  <Text 
                    style={[
                      styles.priceChange,
                      { color: stock.change >= 0 ? COLORS.success : COLORS.error }
                    ]}
                  >
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  viewAll: {
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  stockList: {
    maxHeight: 280,
  },
  stockCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    marginBottom: SIZES.small,
    ...SHADOWS.small,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stockName: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  priceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stockPrice: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  priceChange: {
    fontSize: SIZES.small,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: SIZES.medium,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.small,
    alignSelf: 'center',
  },
  retryText: {
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  emptyText: {
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginVertical: SIZES.medium,
  },
  mockDataBadge: {
    fontSize: SIZES.small,
    color: COLORS.warning,
    backgroundColor: `${COLORS.warning}20`,
    paddingHorizontal: SIZES.small,
    paddingVertical: 2,
    borderRadius: SIZES.small,
    marginRight: SIZES.small,
  }
});
