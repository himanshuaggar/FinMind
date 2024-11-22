import { View, Text, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

export default function MarketSentiment() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Sentiment</Text>
      <View style={styles.sentimentMeter}>
        {/* Add sentiment visualization */}
      </View>
      <View style={styles.insightsContainer}>
        <Text style={styles.insightTitle}>Key Insights</Text>
        {/* Add market insights */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  sentimentMeter: {
    height: 200,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  insightsContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
  },
  insightTitle: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
});
