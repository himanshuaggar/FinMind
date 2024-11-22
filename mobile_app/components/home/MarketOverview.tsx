import { View, Text, StyleSheet, ScrollView } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

export default function MarketOverview() {
  const indices = [
    { name: "NIFTY 50", value: "19,425.35", change: "+1.2%" },
    { name: "SENSEX", value: "64,718.56", change: "+1.1%" },
    { name: "BANK NIFTY", value: "43,628.90", change: "-0.3%" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Overview</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {indices.map((index, i) => (
          <View key={i} style={styles.indexCard}>
            <Text style={styles.indexName}>{index.name}</Text>
            <Text style={styles.indexValue}>{index.value}</Text>
            <Text 
              style={[
                styles.indexChange,
                { color: index.change.includes("+") ? COLORS.success : COLORS.error }
              ]}
            >
              {index.change}
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
});
