import { View, Text, StyleSheet, ProgressBar } from "react-native";
import { COLORS, SIZES } from "../../constants/theme";

export default function GoalsTracker() {
  const goals = [
    { name: "Emergency Fund", target: 100000, current: 75000 },
    { name: "Retirement", target: 1000000, current: 450000 },
    // Add more goals
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Investment Goals</Text>
      {goals.map((goal, index) => (
        <View key={index} style={styles.goalItem}>
          <Text style={styles.goalName}>{goal.name}</Text>
          <ProgressBar
            progress={goal.current / goal.target}
            color={COLORS.primary}
          />
        </View>
      ))}
    </View>
  );
}
