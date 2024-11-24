import { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import Input from '../common/Input';
import Button from '../common/Button';
import { COLORS, SIZES } from '../../constants/theme';

interface FinancialData {
  income: number;
  expenses: Record<string, number>;
  savings: number;
  investments: Record<string, number>;
  debts: Record<string, number>;
  goals: string[];
}

interface FinancialDataFormProps {
  onSubmit: (data: FinancialData) => void;
  initialData?: FinancialData;
}

export default function FinancialDataForm({ onSubmit, initialData }: FinancialDataFormProps) {
  const [financialData, setFinancialData] = useState<FinancialData>(initialData || {
    income: 0,
    expenses: {
      Housing: 0,
      Food: 0,
      Transportation: 0,
      Utilities: 0,
      Entertainment: 0,
      Other: 0
    },
    savings: 0,
    investments: {
      Stocks: 0,
      'Mutual Funds': 0,
      'Fixed Deposits': 0,
      'Real Estate': 0,
      Other: 0
    },
    debts: {
      'Home Loan': 0,
      'Car Loan': 0,
      'Personal Loan': 0,
      'Credit Card': 0,
      'Other Debts': 0
    },
    goals: []
  });

  const [newGoal, setNewGoal] = useState('');

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setFinancialData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setFinancialData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Financial Information</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Income</Text>
        <Input
          label="Monthly Income (₹)"
          value={financialData.income.toString()}
          onChangeText={(value) => setFinancialData(prev => ({
            ...prev,
            income: Number(value) || 0
          }))}
          keyboardType="numeric"
        />
      </View>

      {/* Expenses Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Expenses</Text>
        {Object.keys(financialData.expenses).map((category) => (
          <Input
            key={category}
            label={`${category} (₹)`}
            value={financialData.expenses[category].toString()}
            onChangeText={(value) => setFinancialData(prev => ({
              ...prev,
              expenses: {
                ...prev.expenses,
                [category]: Number(value) || 0
              }
            }))}
            keyboardType="numeric"
          />
        ))}
      </View>

      {/* Investments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Investments</Text>
        {Object.keys(financialData.investments).map((category) => (
          <Input
            key={category}
            label={`${category} (₹)`}
            value={financialData.investments[category].toString()}
            onChangeText={(value) => setFinancialData(prev => ({
              ...prev,
              investments: {
                ...prev.investments,
                [category]: Number(value) || 0
              }
            }))}
            keyboardType="numeric"
          />
        ))}
      </View>

      {/* Debts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debts</Text>
        {Object.keys(financialData.debts).map((category) => (
          <Input
            key={category}
            label={`${category} (₹)`}
            value={financialData.debts[category].toString()}
            onChangeText={(value) => setFinancialData(prev => ({
              ...prev,
              debts: {
                ...prev.debts,
                [category]: Number(value) || 0
              }
            }))}
            keyboardType="numeric"
          />
        ))}
      </View>

      {/* Financial Goals Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Goals</Text>
        <View style={styles.goalInput}>
          <Input
            label="Add a financial goal"
            value={newGoal}
            onChangeText={setNewGoal}
            onSubmitEditing={handleAddGoal}
          />
          <Button title="Add" onPress={handleAddGoal} />
        </View>
        {financialData.goals.map((goal, index) => (
          <View key={index} style={styles.goalItem}>
            <Text style={styles.goalText}>{goal}</Text>
            <Button 
              title="Remove" 
              onPress={() => handleRemoveGoal(index)}
              type="secondary"
            />
          </View>
        ))}
      </View>

      <Button 
        title="Save Financial Data" 
        onPress={() => onSubmit(financialData)}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.medium,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: SIZES.xLarge,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SIZES.large,
  },
  section: {
    marginBottom: SIZES.large,
    color:'white',
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: 'white',
    marginBottom: SIZES.small,
  },
  goalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.small,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.small,
    marginBottom: SIZES.xSmall,
  },
  goalText: {
    flex: 1,
    color: COLORS.textPrimary,
    marginRight: SIZES.small,
  },
  submitButton: {
    marginVertical: SIZES.large,
  }
});
