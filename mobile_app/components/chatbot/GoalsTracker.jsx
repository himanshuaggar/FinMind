import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";
import { getUserGoals } from "../../services/api";
import Loading from "../common/Loading";
import { COLORS, SIZES } from "../../constants/theme";

export default function GoalsTracker() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await getUserGoals();
      setGoals(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Investment Goals</Text>
      {goals.map((goal, index) => (
        <View key={index} style={styles.goalItem}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalName}>{goal.name}</Text>
            <Text style={styles.goalProgress}>
              {`₹${goal.current.toLocaleString()} / ₹${goal.target.toLocaleString()}`}
            </Text>
          </View>
          <Progress.Bar
            progress={goal.current / goal.target}
            width={null}
            height={8}
            color={COLORS.primary}
            unfilledColor={COLORS.gray2}
            borderWidth={0}
            style={styles.progressBar}
          />
          <Text style={styles.percentageText}>
            {`${Math.round((goal.current / goal.target) * 100)}%`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginVertical: SIZES.small,
    shadowColor: COLORS.gray2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginBottom: SIZES.medium,
  },
  goalItem: {
    marginBottom: SIZES.medium,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small / 2,
  },
  goalName: {
    fontSize: SIZES.medium,
    fontWeight: "500",
    color: COLORS.secondary,
  },
  goalProgress: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  progressBar: {
    width: "100%",
    marginVertical: SIZES.small / 2,
  },
  percentageText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    textAlign: "right",
    marginTop: 2,
  },
});
