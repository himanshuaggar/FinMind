import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useUser } from '../../contexts/UserContext';
import { getAIInsights, getMarketOverview, getLatestAnalysis } from '../../services/api';
import AIHighlights from "../../components/home/AIHighlights";
import QuickActions from "../../components/home/QuickActions";
import MarketPulse from "../../components/home/MarketPulse";
import SmartAlerts from "../../components/home/SmartAlerts";
import PersonalizedInsights from "../../components/home/PersonalizedInsights";
import Loading from '../../components/common/Loading';
import { COLORS, SIZES } from "../../constants/theme";
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  const router = useRouter();
  const { userId, userProfile } = useUser();
  const [aiInsights, setAIInsights] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [insights, market, analysis] = await Promise.all([
        getAIInsights(userId),
        getMarketOverview(),
        getLatestAnalysis(userId)
      ]);

      setAIInsights(insights);
      setMarketData(market);
      setLatestAnalysis(analysis);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={[COLORS.primary + '20', COLORS.background]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{userProfile?.name || 'User'}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => router.push("/search")}
              >
                <MaterialIcons name="search" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => router.push("/notifications")}
              >
                <View style={styles.notificationBadge}>
                  <FontAwesome5 name="bell" size={24} color={COLORS.textPrimary} />
                  <View style={styles.badge} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <AIHighlights 
            onPress={() => router.push("/ai-analyst")}
            userId={userId}
          />
          <QuickActions />
          <MarketPulse 
            data={marketData}
            onPress={() => router.push("/stocks")}
          />
          <SmartAlerts 
            alerts={latestAnalysis?.alerts}
            onPress={() => router.push("/notifications")}
          />
          <PersonalizedInsights 
            insights={latestAnalysis?.insights}
            onPress={() => router.push("/chatbot")}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// Helper function to get appropriate greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
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
  headerGradient: {
    paddingTop: SIZES.small,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.small,
  },
  iconButton: {
    padding: SIZES.xSmall,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.cardBackground,
  },
  content: {
    padding: SIZES.medium,
    gap: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.small,
  },
  cardContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginBottom: SIZES.small,
  },
});
