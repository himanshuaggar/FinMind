import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const formatNumber = (value: number | undefined, decimals: number = 2): string => {
  if (value === undefined || value === null) return 'N/A';
  return Number(value).toFixed(decimals);
};

const StockInfo = ({ fundamentals }) => {
  if (!fundamentals) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No fundamental data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fundamental Data</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Current Price:</Text>
        <Text style={styles.value}>
          {fundamentals.currency} {formatNumber(fundamentals.currentPrice)}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>52 Week Change:</Text>
        <Text style={styles.value}>
          {formatNumber(fundamentals['52WeekChange'] * 100)}%
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Day Range:</Text>
        <Text style={styles.value}>
          {formatNumber(fundamentals.dayLow)} - {formatNumber(fundamentals.dayHigh)}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>52 Week Range:</Text>
        <Text style={styles.value}>
          {formatNumber(fundamentals.fiftyTwoWeekLow)} - {formatNumber(fundamentals.fiftyTwoWeekHigh)}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Volume:</Text>
        <Text style={styles.value}>
          {fundamentals.averageVolume?.toLocaleString() ?? 'N/A'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Market Cap:</Text>
        <Text style={styles.value}>
          {fundamentals.marketCap?.toLocaleString() ?? 'N/A'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>P/E Ratio:</Text>
        <Text style={styles.value}>
          {formatNumber(fundamentals.trailingPE)}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Dividend Yield:</Text>
        <Text style={styles.value}>
          {formatNumber(fundamentals.dividendYield * 100)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    marginVertical: SIZES.small,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.medium,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.small / 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray2,
  },
  label: {
    fontSize: SIZES.medium,
    color: COLORS.secondary,
  },
  value: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: '500',
  },
  error: {
    color: COLORS.tertiary,
    textAlign: 'center',
    fontSize: SIZES.medium,
  }
});

export default StockInfo;
