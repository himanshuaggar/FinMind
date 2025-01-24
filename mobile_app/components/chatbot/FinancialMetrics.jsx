import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

export default function FinancialMetrics({ financialData }) {
  const calculateMetrics = () => {
    const totalExpenses = Object.values(financialData.expenses).reduce(
      (a, b) => a + b,
      0
    );
    const totalInvestments = Object.values(financialData.investments).reduce(
      (a, b) => a + b,
      0
    );
    const totalDebts = Object.values(financialData.debts).reduce(
      (a, b) => a + b,
      0
    );
    const monthlySavings = financialData.income - totalExpenses;
    const savingsRate = (monthlySavings / financialData.income) * 100;
    const debtToIncome = (totalDebts / financialData.income) * 100;

    return {
      totalExpenses,
      totalInvestments,
      totalDebts,
      monthlySavings,
      savingsRate,
      debtToIncome,
    };
  };

  const metrics = calculateMetrics();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Financial Overview</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Monthly Savings</Text>
          <Text style={styles.metricValue}>
            ₹{metrics.monthlySavings.toLocaleString()}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Savings Rate</Text>
          <Text style={styles.metricValue}>
            {metrics.savingsRate.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Debt/Income</Text>
          <Text style={styles.metricValue}>
            {metrics.debtToIncome.toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    margin: SIZES.medium,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xSmall,
  },
  metricValue: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
