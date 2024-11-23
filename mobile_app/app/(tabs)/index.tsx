import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { useUser } from '../../contexts/UserContext';
import { getPortfolioData, getMarketOverview, getWatchlistData } from '../../services/api';
import PortfolioSummary from "../../components/home/PortfolioSummary";
import QuickActions from "../../components/home/QuickActions";
import MarketOverview from "../../components/home/MarketOverview";
import WatchlistPreview from "../../components/home/WatchlistPreview";
import Loading from '../../components/common/Loading';
import { COLORS, SIZES } from "../../constants/theme";

export default function Home() {
  const router = useRouter();
  const { userId, userProfile } = useUser();
  const [portfolioData, setPortfolioData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [watchlistData, setWatchlistData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [portfolio, market, watchlist] = await Promise.all([
        getPortfolioData(userId),
        getMarketOverview(),
        getWatchlistData(userId)
      ]);

      setPortfolioData(portfolio);
      setMarketData(market);
      setWatchlistData(watchlist);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>{userProfile?.name || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/notifications")}>
            <View style={styles.notificationBadge}>
              <FontAwesome5 name="bell" size={24} color={COLORS.textPrimary} />
              <View style={styles.badge} />
            </View>
          </TouchableOpacity>
        </View>

        <PortfolioSummary data={portfolioData} />
        <QuickActions />
        <MarketOverview data={marketData} />
        <WatchlistPreview data={watchlistData} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
  },
  greeting: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: SIZES.xLarge,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  notificationBadge: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
});
