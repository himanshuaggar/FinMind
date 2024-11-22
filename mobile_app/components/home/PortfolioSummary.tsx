import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

const screenWidth = Dimensions.get("window").width;

export default function PortfolioSummary() {
  const timeRanges = ["1D", "1W", "1M", "3M", "1Y", "ALL"];
  const [selectedRange, setSelectedRange] = useState("1M");

  const portfolioData = {
    "1M": {
      labels: ["1", "7", "14", "21", "28"],
      datasets: [{
        data: [245000, 252000, 248000, 260000, 275000],
      }]
    },
    // Add data for other time ranges
  };

  const stats = [
    { label: "Total Value", value: "₹2,75,000", change: "+12.2%" },
    { label: "Today's Gain", value: "₹5,890", change: "+2.4%" },
    { label: "Total Gain", value: "₹30,000", change: "+12.2%" },
  ];

  const assetAllocation = [
    { type: "Stocks", percentage: 60, color: COLORS.primary },
    { type: "Mutual Funds", percentage: 25, color: COLORS.success },
    { type: "Crypto", percentage: 15, color: COLORS.warning },
  ];

  return (
    <Animated.View 
      entering={FadeInDown.duration(500)}
      style={styles.container}
    >
      {/* Portfolio Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio Overview</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <FontAwesome5 name="sync-alt" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Portfolio Value */}
      <View style={styles.valueContainer}>
        <Text style={styles.totalValue}>₹2,75,000</Text>
        <View style={styles.changeContainer}>
          <FontAwesome5 
            name="arrow-up" 
            size={12} 
            color={COLORS.success} 
            style={styles.arrow}
          />
          <Text style={styles.changeText}>12.2%</Text>
        </View>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              selectedRange === range && styles.selectedTimeRange
            ]}
            onPress={() => setSelectedRange(range)}
          >
            <Text style={[
              styles.timeRangeText,
              selectedRange === range && styles.selectedTimeRangeText
            ]}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <LineChart
        data={portfolioData[selectedRange]}
        width={screenWidth - SIZES.medium * 4}
        height={180}
        chartConfig={{
          backgroundColor: "transparent",
          backgroundGradientFrom: COLORS.cardBackground,
          backgroundGradientTo: COLORS.cardBackground,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
          labelColor: () => COLORS.textSecondary,
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: COLORS.primary
          },
          propsForBackgroundLines: {
            strokeDasharray: "", // Solid lines
            stroke: `${COLORS.gray}20`,
          },
        }}
        bezier
        style={styles.chart}
        withHorizontalLines={true}
        withVerticalLines={false}
        withDots={true}
        withShadow={false}
        segments={4}
      />

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={[styles.statChange, { color: stat.change.includes('+') ? COLORS.success : COLORS.error }]}>
              {stat.change}
            </Text>
          </View>
        ))}
      </View>

      {/* Asset Allocation */}
      <View style={styles.allocationContainer}>
        <Text style={styles.allocationTitle}>Asset Allocation</Text>
        <View style={styles.allocationBar}>
          {assetAllocation.map((asset, index) => (
            <View
              key={index}
              style={[
                styles.allocationSegment,
                {
                  backgroundColor: asset.color,
                  width: `${asset.percentage}%`,
                  borderTopLeftRadius: index === 0 ? SIZES.small : 0,
                  borderBottomLeftRadius: index === 0 ? SIZES.small : 0,
                  borderTopRightRadius: index === assetAllocation.length - 1 ? SIZES.small : 0,
                  borderBottomRightRadius: index === assetAllocation.length - 1 ? SIZES.small : 0,
                }
              ]}
            />
          ))}
        </View>
        <View style={styles.allocationLegend}>
          {assetAllocation.map((asset, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: asset.color }]} />
              <Text style={styles.legendText}>{asset.type} ({asset.percentage}%)</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginHorizontal: SIZES.medium,
    marginTop: SIZES.medium,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  refreshButton: {
    padding: SIZES.small,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  totalValue: {
    fontSize: SIZES.xLarge * 1.2,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginRight: SIZES.small,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.xSmall,
    borderRadius: SIZES.small,
  },
  arrow: {
    marginRight: 4,
  },
  changeText: {
    color: COLORS.success,
    fontWeight: "bold",
  },
  timeRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.medium,
  },
  timeRangeButton: {
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.xSmall,
    borderRadius: SIZES.small,
  },
  selectedTimeRange: {
    backgroundColor: COLORS.primary,
  },
  timeRangeText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
  },
  selectedTimeRangeText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  chart: {
    marginVertical: SIZES.medium,
    borderRadius: SIZES.small,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.medium,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: SIZES.small,
    backgroundColor: `${COLORS.gray}10`,
    borderRadius: SIZES.small,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statChange: {
    fontSize: SIZES.small,
    fontWeight: "bold",
  },
  allocationContainer: {
    marginTop: SIZES.medium,
  },
  allocationTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.small,
  },
  allocationBar: {
    flexDirection: "row",
    height: 12,
    borderRadius: SIZES.small,
    overflow: "hidden",
    marginBottom: SIZES.small,
  },
  allocationSegment: {
    height: "100%",
  },
  allocationLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SIZES.medium,
    marginBottom: SIZES.xSmall,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SIZES.small,
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
  },
});
