import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../constants/theme";

const FinancialTipCard = ({ tip, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={tip.icon} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.category}>{tip.category}</Text>
        <Text style={styles.title}>{tip.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {tip.description}
        </Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={COLORS.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    marginBottom: SIZES.small,
  },
  iconContainer: {
    backgroundColor: COLORS.primary + "20",
    padding: SIZES.small,
    borderRadius: SIZES.small,
    marginRight: SIZES.medium,
  },
  content: {
    flex: 1,
  },
  category: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
});

export default FinancialTipCard;
