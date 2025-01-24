import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { COLORS, SIZES } from "../../constants/theme";
import { getStockChartData } from "../../services/api";
import Loading from "../common/Loading";

export default function StockChart({ symbol, initialData }) {
  const [timeRange, setTimeRange] = useState("1M");
  const [chartData, setChartData] = useState(initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const screenWidth = Dimensions.get("window").width;

  const fetchChartData = async (range) => {
    try {
      setLoading(true);
      setError("");
      const data = await getStockChartData(symbol, range);
      console.log(data);

      const historicalData = data.prices;
      const dates = data.dates;
      const prices = historicalData;

      const previousClose = data.previousClose || 0;
      const currentPrice = data.currentPrice || 0;

      setChartData({
        symbol: data.symbol,
        currentPrice: currentPrice,
        previousClose: previousClose,
        change: previousClose
          ? ((currentPrice - previousClose) / previousClose) * 100
          : 0,
        dates: dates,
        prices: prices,
        volumes: data.volumes || [],
        range,
      });
      setTimeRange(range);
    } catch (err) {
      setError("Failed to load chart data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const timeRanges = ["1D", "1W", "1M", "1Y"];

  const chartConfig = {
    backgroundColor: COLORS.cardBackground,
    backgroundGradientFrom: COLORS.cardBackground,
    backgroundGradientTo: COLORS.cardBackground,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
    labelColor: (opacity = 1) => COLORS.textSecondary,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: COLORS.primary,
    },
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.price}>
            ₹{chartData?.currentPrice?.toFixed(2) || "0.00"}
            <Text
              style={[
                styles.change,
                {
                  color:
                    (chartData?.change || 0) >= 0
                      ? COLORS.success
                      : COLORS.error,
                },
              ]}
            >
              {" "}
              ({chartData?.change >= 0 ? "+" : ""}
              {chartData?.change}%)
            </Text>
          </Text>
        </View>
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        chartData && (
          <LineChart
            data={{
              labels: chartData.dates
                .map((date) =>
                  new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                )
                .filter(
                  (_, i) => i % Math.ceil(chartData.dates.length / 6) === 0
                ),
              datasets: [{ data: chartData.prices }],
            }}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={false}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
          />
        )
      )}
      <View style={styles.timeRangeContainer}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range}
            onPress={() => fetchChartData(range)}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  symbol: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  price: {
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  change: {
    fontSize: SIZES.small,
  },
  timeRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: SIZES.small,
  },
  timeRangeButton: {
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.xSmall,
    borderRadius: SIZES.small,
  },
  timeRangeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  timeRangeText: {
    fontSize: SIZES.small,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  timeRangeTextActive: {
    color: COLORS.white,
  },
  chart: {
    borderRadius: SIZES.medium,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
    marginTop: SIZES.medium,
  },
});
