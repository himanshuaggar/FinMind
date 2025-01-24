import { View, StyleSheet, ViewStyle } from "react-native";
import { COLORS, SHADOWS, SIZES } from "../../constants/theme";

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    ...SHADOWS.medium,
  },
});
