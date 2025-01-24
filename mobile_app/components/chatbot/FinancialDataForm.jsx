import { useState } from "react";
import { View, ScrollView, StyleSheet, Text, Dimensions } from "react-native";
import Input from "../common/Input";
import Button from "../common/Button";
import { COLORS, SIZES } from "../../constants/theme";

const safeToString = (value) => {
  if (value === undefined || value === null) return "0";
  return value.toString();
};

const parseNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const num = Number(value.toString().replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : num;
};

export default function FinancialDataForm({ onSubmit, initialData }) {
  // Default initial state with all required fields
  const defaultData = {
    income: 0,
    expenses: {
      Housing: 0,
      Food: 0,
      Transportation: 0,
      Utilities: 0,
      Entertainment: 0,
      Other: 0,
    },
    savings: 0,
    investments: {
      Stocks: 0,
      "Mutual Funds": 0,
      "Fixed Deposits": 0,
      "Real Estate": 0,
      Other: 0,
    },
    debts: {
      "Home Loan": 0,
      "Car Loan": 0,
      "Personal Loan": 0,
      "Credit Card": 0,
      "Other Debts": 0,
    },
    goals: [],
  };

  const [financialData, setFinancialData] = useState({
    ...defaultData,
    ...initialData,
  });

  const [newGoal, setNewGoal] = useState("");

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setFinancialData((prev) => ({
        ...prev,
        goals: [...(prev.goals || []), newGoal.trim()],
      }));
      setNewGoal("");
    }
  };

  const handleRemoveGoal = (index) => {
    setFinancialData((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    const validatedData = {
      income: parseNumber(financialData.income),
      expenses: {
        Housing: parseNumber(financialData.expenses?.Housing),
        Food: parseNumber(financialData.expenses?.Food),
        Transportation: parseNumber(financialData.expenses?.Transportation),
        Utilities: parseNumber(financialData.expenses?.Utilities),
        Entertainment: parseNumber(financialData.expenses?.Entertainment),
        Other: parseNumber(financialData.expenses?.Other),
      },
      savings: parseNumber(financialData.savings),
      investments: {
        Stocks: parseNumber(financialData.investments?.Stocks),
        "Mutual Funds": parseNumber(
          financialData.investments?.["Mutual Funds"]
        ),
        "Fixed Deposits": parseNumber(
          financialData.investments?.["Fixed Deposits"]
        ),
        "Real Estate": parseNumber(financialData.investments?.["Real Estate"]),
        Other: parseNumber(financialData.investments?.Other),
      },
      debts: {
        "Home Loan": parseNumber(financialData.debts?.["Home Loan"]),
        "Car Loan": parseNumber(financialData.debts?.["Car Loan"]),
        "Personal Loan": parseNumber(financialData.debts?.["Personal Loan"]),
        "Credit Card": parseNumber(financialData.debts?.["Credit Card"]),
        "Other Debts": parseNumber(financialData.debts?.["Other Debts"]),
      },
      goals: financialData.goals || [],
    };

    onSubmit(validatedData);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Financial Information</Text>

      {/* Income Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Income</Text>
        <Input
          label="Monthly Income (₹)"
          value={safeToString(financialData.income)}
          onChangeText={(value) =>
            setFinancialData((prev) => ({
              ...prev,
              income: parseNumber(value),
            }))
          }
          keyboardType="numeric"
        />
      </View>

      {/* Expenses Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Expenses</Text>
        {Object.keys(defaultData.expenses).map((key) => (
          <Input
            key={key}
            label={`${key} (₹)`}
            value={safeToString(financialData.expenses?.[key])}
            onChangeText={(value) =>
              setFinancialData((prev) => ({
                ...prev,
                expenses: {
                  ...prev.expenses,
                  [key]: parseNumber(value),
                },
              }))
            }
            keyboardType="numeric"
          />
        ))}
      </View>

      {/* Investments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investments</Text>
        {Object.keys(defaultData.investments).map((key) => (
          <Input
            key={key}
            label={`${key} (₹)`}
            value={safeToString(financialData.investments?.[key])}
            onChangeText={(value) =>
              setFinancialData((prev) => ({
                ...prev,
                investments: {
                  ...prev.investments,
                  [key]: parseNumber(value),
                },
              }))
            }
            keyboardType="numeric"
          />
        ))}
      </View>

      {/* Debts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debts</Text>
        {Object.keys(defaultData.debts).map((key) => (
          <Input
            key={key}
            label={`${key} (₹)`}
            value={safeToString(financialData.debts?.[key])}
            onChangeText={(value) =>
              setFinancialData((prev) => ({
                ...prev,
                debts: {
                  ...prev.debts,
                  [key]: parseNumber(value),
                },
              }))
            }
            keyboardType="numeric"
          />
        ))}
      </View>

      {/* Goals Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Goals</Text>
        <View style={styles.goalInput}>
          <Input
            label="Add a financial goal"
            value={newGoal}
            style={{
              width: "100%",
              minWidth: Dimensions.get("window").width - 100,
            }}
            onChangeText={setNewGoal}
            onSubmitEditing={handleAddGoal}
          />
          <Button title="Add" onPress={handleAddGoal} variant="primary" />
        </View>
        {(financialData.goals || []).map((goal, index) => (
          <View key={index} style={styles.goalItem}>
            <Text style={styles.goalText}>{goal}</Text>
            <Button
              title="Remove"
              onPress={() => handleRemoveGoal(index)}
              variant="secondary"
            />
          </View>
        ))}
      </View>

      <View style={styles.submitButtonContainer}>
        <Button title="Save Financial Data" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.medium,
    backgroundColor: COLORS.background,
    paddingBottom: SIZES.xxLarge,
  },
  title: {
    fontSize: SIZES.xLarge,
    fontWeight: "bold",
    color: "white",
    marginBottom: SIZES.large,
  },
  section: {
    marginBottom: SIZES.large,
    color: "white",
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: "600",
    color: "white",
    marginBottom: SIZES.small,
  },
  goalInput: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SIZES.small,
    width: "100%",
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SIZES.small,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.small,
    marginBottom: SIZES.xSmall,
  },
  goalText: {
    flex: 1,
    color: COLORS.textPrimary,
    marginRight: SIZES.small,
    width: "100%",
  },
  submitButtonContainer: {
    marginBottom: SIZES.xxLarge,
  },
});
