import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../constants/theme";

interface RiskLevel {
  level: string;
  color: string;
  description: string;
  recommendations: string[];
}

export default function RiskAssessment({ riskScore = 65 }) { // Risk score from 0-100
  const [currentRisk, setCurrentRisk] = useState<RiskLevel>();
  const progressAnimation = useRef(new Animated.Value(0)).current;

  const riskLevels: RiskLevel[] = [
    {
      level: "Low Risk",
      color: COLORS.success,
      description: "Conservative investment approach with focus on capital preservation",
      recommendations: [
        "Consider government bonds and blue-chip stocks",
        "Maintain higher allocation in fixed deposits",
        "Focus on dividend-paying stocks"
      ]
    },
    {
      level: "Moderate Risk",
      color: COLORS.warning,
      description: "Balanced approach with mix of growth and stability",
      recommendations: [
        "Diversify across large and mid-cap stocks",
        "Consider balanced mutual funds",
        "Explore corporate bonds with good ratings"
      ]
    },
    {
      level: "High Risk",
      color: COLORS.error,
      description: "Aggressive approach focusing on growth potential",
      recommendations: [
        "Look into small-cap growth stocks",
        "Consider sector-specific investments",
        "Explore international market opportunities"
      ]
    }
  ];

  useEffect(() => {
    // Determine risk level based on score
    if (riskScore <= 33) {
      setCurrentRisk(riskLevels[0]);
    } else if (riskScore <= 66) {
      setCurrentRisk(riskLevels[1]);
    } else {
      setCurrentRisk(riskLevels[2]);
    }

    // Animate risk meter
    Animated.timing(progressAnimation, {
      toValue: riskScore,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [riskScore]);

  const progressInterpolate = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Risk Assessment</Text>
      
      {/* Risk Meter */}
      <View style={styles.riskMeter}>
        <View style={styles.meterContainer}>
          <View style={styles.meterBackground}>
            <Animated.View
              style={[
                styles.meterFill,
                {
                  transform: [{ rotate: progressInterpolate }],
                  backgroundColor: currentRisk?.color,
                },
              ]}
            />
          </View>
          <View style={styles.meterCenter}>
            <Text style={styles.riskScore}>{riskScore}%</Text>
            <Text style={styles.riskLevel}>{currentRisk?.level}</Text>
          </View>
        </View>

        {/* Risk Description */}
        <View style={styles.riskDescription}>
          <Text style={styles.descriptionText}>
            {currentRisk?.description}
          </Text>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationTitle}>
          Personalized Recommendations
        </Text>
        {currentRisk?.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <FontAwesome5 
              name="check-circle" 
              size={16} 
              color={currentRisk.color} 
              style={styles.recommendationIcon}
            />
            <Text style={styles.recommendationText}>
              {recommendation}
            </Text>
          </View>
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
    marginHorizontal: SIZES.medium,
    marginTop: SIZES.medium,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  riskMeter: {
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  meterContainer: {
    width: 200,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.medium,
  },
  meterBackground: {
    width: 200,
    height: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: `${COLORS.gray}20`,
    overflow: "hidden",
    position: "absolute",
  },
  meterFill: {
    width: 200,
    height: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    position: "absolute",
    transform: [{ rotate: "0deg" }],
    transformOrigin: "center bottom",
  },
  meterCenter: {
    position: "absolute",
    alignItems: "center",
  },
  riskScore: {
    fontSize: SIZES.xLarge,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  riskLevel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  riskDescription: {
    backgroundColor: `${COLORS.gray}10`,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    marginTop: SIZES.small,
  },
  descriptionText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  recommendationsContainer: {
    marginTop: SIZES.medium,
  },
  recommendationTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  recommendationIcon: {
    marginRight: SIZES.small,
  },
  recommendationText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
});
