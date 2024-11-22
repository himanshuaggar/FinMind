import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface StockInfoProps {
  fundamentals: {
    PE_Ratio: number;
    EPS: number;
    Market_Cap: number;
    Dividend_Yield: number;
    Revenue: number;
    Profit_Margin: number;
    Debt_to_Equity: number;
    ROE: number;
  };
}

export default function StockInfo({ fundamentals }: StockInfoProps) {
  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(2)}%`;
      case 'currency':
        return `₹${value.toLocaleString()}`;
      default:
        return value.toFixed(2);
    }
  };

  const metrics = [
    { label: 'P/E Ratio', value: fundamentals.PE_Ratio, type: 'number' },
    { label: 'EPS', value: fundamentals.EPS, type: 'currency' },
    { label: 'Market Cap', value: fundamentals.Market_Cap, type: 'currency' },
    { label: 'Dividend Yield', value: fundamentals.Dividend_Yield, type: 'percentage' },
    { label: 'Revenue', value: fundamentals.Revenue, type: 'currency' },
    { label: 'Profit Margin', value: fundamentals.Profit_Margin, type: 'percentage' },
    { label: 'Debt to Equity', value: fundamentals.Debt_to_Equity, type: 'number' },
    { label: 'ROE', value: fundamentals.ROE, type: 'percentage' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fundamental Analysis</Text>
      <View style={styles.grid}>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricContainer}>
            <Text style={styles.label}>{metric.label}</Text>
            <Text style={styles.value}>
              {formatValue(metric.value, metric.type)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.small,
    marginVertical: SIZES.small,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricContainer: {
    width: '48%',
    marginBottom: SIZES.medium,
  },
  label: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.xSmall,
  },
  value: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
});
