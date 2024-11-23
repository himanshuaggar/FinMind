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

interface RiskAssessmentProps {
  stockData: any;
}

export default function RiskAssessment({ stockData }: RiskAssessmentProps) {
  const [currentRisk, setCurrentRisk] = useState<RiskLevel>();
  const [riskScore, setRiskScore] = useState(0);
  const progressAnimation = useRef(new Animated.Value(0)).current;

  const riskLevels: RiskLevel[] = [
    {
      level: "Low Risk",
      color: COLORS.success,
      description: "Conservative investment approach with focus on capital preservation",
      recommendations: [
        "Consider long-term holding",
        "Good for conservative portfolios",
        "Monitor for major changes"
      ]
    },
    {
      level: "Moderate Risk",
      color: COLORS.warning,
      description: "Balanced approach with mix of growth and stability",
      recommendations: [
        "Regular portfolio rebalancing",
        "Set stop-loss orders",
        "Diversify holdings"
      ]
    },
    {
      level: "High Risk",
      color: COLORS.error,
      description: "Aggressive approach with high volatility",
      recommendations: [
        "Close monitoring required",
        "Strict risk management",
        "Consider position sizing"
      ]
    }
  ];

  useEffect(() => {
    calculateRiskScore();
  }, [stockData]);

  const calculateRiskScore = () => {
    // Calculate risk score based on various factors
    const volatility = stockData.volatility || 0;
    const beta = stockData.beta || 1;
    const marketCap = stockData.marketCap || 0;
    
    let score = 0;
    
    // Volatility factor (0-40 points)
    score += Math.min(volatility * 20, 40);
    
    // Beta factor (0-30 points)
    score += Math.min(beta * 15, 30);
    
    // Market cap factor (0-30 points)
    const marketCapScore = marketCap < 2000000000 ? 30 :
                          marketCap < 10000000000 ? 20 : 10;
    score += marketCapScore;
    
    setRiskScore(score);
    
    // Determine risk level
    if (score <= 33) {
      setCurrentRisk(riskLevels[0]);
    } else if (score <= 66) {
      setCurrentRisk(riskLevels[1]);
    } else {
      setCurrentRisk(riskLevels[2]);
    }

    // Animate the risk meter
    Animated.timing(progressAnimation, {
      toValue: score / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const rotateData = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Risk Assessment</Text>
      
      <View style={styles.meterContainer}>
        <View style={styles.meter}>
          <Animated.View
            style={[
              styles.meterFill,
              {
                backgroundColor: currentRisk?.color,
                transform: [{ rotate: rotateData }],
              },
            ]}
          />
          <View style={[styles.meterCenter, { bottom: 0 }]}>
            <Text style={styles.riskScore}>{Math.round(riskScore)}%</Text>
            <Text style={styles.riskLevel}>{currentRisk?.level}</Text>
          </View>
        </View>
      </View>

      <View style={styles.riskDescription}>
        <Text style={styles.descriptionText}>{currentRisk?.description}</Text>
      </View>

      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationTitle}>Recommendations</Text>
        {currentRisk?.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <FontAwesome5
              name="check-circle"
              size={16}
              color={currentRisk.color}
              style={styles.recommendationIcon}
            />
            <Text style={styles.recommendationText}>{recommendation}</Text>
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
    marginBottom: SIZES.medium,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  meterContainer: {
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  meter: {
    width: 200,
    height: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: `${COLORS.gray}20`,
    overflow: "hidden",
    position: "relative",
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
