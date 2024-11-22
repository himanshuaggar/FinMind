import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

export default function WatchlistPreview() {
  const router = useRouter();
  
  const watchlist = [
    { symbol: "RELIANCE", name: "Reliance Industries", price: "2,456.75", change: "+2.3%" },
    { symbol: "TCS", name: "Tata Consultancy", price: "3,421.90", change: "-0.8%" },
    { symbol: "INFY", name: "Infosys Limited", price: "1,567.45", change: "+1.2%" },
    { symbol: "HDFC", name: "HDFC Bank", price: "1,678.30", change: "+0.7%" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Watchlist</Text>
        <TouchableOpacity onPress={() => router.push("/watchlist")}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.stockList}>
        {watchlist.map((stock, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.stockCard}
            onPress={() => router.push(`/stocks/${stock.symbol}`)}
          >
            <View style={styles.stockInfo}>
              <Text style={styles.stockSymbol}>{stock.symbol}</Text>
              <Text style={styles.stockName}>{stock.name}</Text>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.stockPrice}>₹{stock.price}</Text>
              <Text 
                style={[
                  styles.priceChange,
                  { color: stock.change.includes("+") ? COLORS.success : COLORS.error }
                ]}
              >
                {stock.change}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
});
