import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { Portfolio } from '../../types';
import Loading from '../common/Loading';

interface PortfolioSummaryProps {
  data: Portfolio | null;
  onRefresh?: () => void;
}

export default function PortfolioSummary({ data, onRefresh }: PortfolioSummaryProps) {
  const [selectedRange, setSelectedRange] = useState('1M');
  const timeRanges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No portfolio data available</Text>
      </View>
    );
  }

  const chartData = {
    labels: data.historicalData.slice(-30).map(item => 
      new Date(item.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
    ),
    datasets: [{
      data: data.historicalData.slice(-30).map(item => item.value)
    }]
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio Overview</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <FontAwesome5 name="sync-alt" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.totalValue}>
          ₹{data.totalValue.toLocaleString('en-IN', { 
            maximumFractionDigits: 2 
          })}
        </Text>
        <View style={styles.changeContainer}>
          <FontAwesome5 
            name={data.todayGain >= 0 ? "arrow-up" : "arrow-down"}
            size={12} 
            color={data.todayGain >= 0 ? COLORS.success : COLORS.error}
            style={styles.arrow}
          />
          <Text style={[
            styles.changeText,
            { color: data.todayGain >= 0 ? COLORS.success : COLORS.error }
          ]}>
            {Math.abs(data.todayGain).toFixed(2)}%
          </Text>
        </View>
      </View>

      {data.historicalData.length > 0 && (
        <>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: COLORS.white,
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              decimalPlaces: 2,
              color: (opacity = 1) => COLORS.primary,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />

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
        </>
      )}

      {/* Rest of the component */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginHorizontal: SIZES.medium,
    marginTop: SIZES.medium,
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
  emptyText: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SIZES.medium,
  },
});
