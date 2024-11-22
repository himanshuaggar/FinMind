import { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import Input from '../common/Input';
import Button from '../common/Button';
import { COLORS, SIZES } from '../../constants/theme';

interface FinancialData {
  income: number;
  expenses: Record<string, number>;
  investments: Record<string, number>;
  debts: Record<string, number>;
  goals: string[];
}

interface FinancialDataFormProps {
  onSubmit: (data: FinancialData) => void;
}

export default function FinancialDataForm({ onSubmit }: FinancialDataFormProps) {
  const [financialData, setFinancialData] = useState<FinancialData>({
    income: 0,
    expenses: {},
    investments: {},
    debts: {},
    goals: [],
  });

  const expenseCategories = ['Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment'];
  const investmentCategories = ['Stocks', 'Mutual Funds', 'Fixed Deposits', 'Real Estate'];
  const debtCategories = ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card'];

  const handleSubmit = () => {
    onSubmit(financialData);
  };

  return (
    <ScrollView style={styles.container}>
      <Input
        label="Monthly Income"
        value={financialData.income.toString()}
        onChangeText={(text) => 
          setFinancialData({ ...financialData, income: parseFloat(text) || 0 })
        }
        keyboardType="numeric"
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Expenses</Text>
        {expenseCategories.map((category) => (
          <Input
            key={category}
            label={category}
            value={financialData.expenses[category]?.toString()}
            onChangeText={(text) => 
              setFinancialData({
                ...financialData,
                expenses: {
                  ...financialData.expenses,
                  [category]: parseFloat(text) || 0,
                },
              })
            }
            keyboardType="numeric"
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investments</Text>
        {investmentCategories.map((category) => (
          <Input
            key={category}
            label={category}
            value={financialData.investments[category]?.toString()}
            onChangeText={(text) =>
              setFinancialData({
                ...financialData,
                investments: {
                  ...financialData.investments,
                  [category]: parseFloat(text) || 0,
                },
              })
            }
            keyboardType="numeric"
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debts</Text>
        {debtCategories.map((category) => (
          <Input
            key={category}
            label={category}
            value={financialData.debts[category]?.toString()}
            onChangeText={(text) =>
              setFinancialData({
                ...financialData,
                debts: {
                  ...financialData.debts,
                  [category]: parseFloat(text) || 0,
                },
              })
            }
            keyboardType="numeric"
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Goals</Text>
        <Input
          placeholder="Add a financial goal"
          onSubmitEditing={(event) =>
            setFinancialData({
              ...financialData,
              goals: [...financialData.goals, event.nativeEvent.text],
            })
          }
        />
        {financialData.goals.map((goal, index) => (
          <Text key={index} style={styles.goal}>
            {index + 1}. {goal}
          </Text>
        ))}
      </View>

      <Button title="Save Financial Data" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.medium,
  },
  section: {
    marginVertical: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.small,
  },
  goal: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginVertical: SIZES.small,
  },
});
