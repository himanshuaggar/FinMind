import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import PortfolioSummary from "../../components/home/PortfolioSummary";
import QuickActions from "../../components/home/QuickActions";
import MarketOverview from "../../components/home/MarketOverview";
import WatchlistPreview from "../../components/home/WatchlistPreview";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>John Doe</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/notifications")}>
            <View style={styles.notificationBadge}>
              <FontAwesome5 name="bell" size={24} color={COLORS.textPrimary} />
              <View style={styles.badge} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Portfolio Summary Card */}
        <PortfolioSummary />

        {/* Quick Actions */}
        <QuickActions />

        {/* Market Overview */}
        <MarketOverview />

        {/* Watchlist Preview */}
        <WatchlistPreview />
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
