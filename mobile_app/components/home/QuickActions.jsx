import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES, SHADOWS } from "../../constants/theme";

export default function QuickActions() {
  const navigation = useNavigation();

  const actions = [
    { icon: "exchange-alt", label: "Transfer", route: "Transfer" },
    { icon: "piggy-bank", label: "Save", route: "Savings" },
    { icon: "chart-pie", label: "Invest", route: "Invest" },
    { icon: "file-invoice", label: "Bills", route: "Bills" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionItem}
            onPress={() => navigation.navigate(action.route)}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5
                name={action.icon}
                size={24}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  actionItem: {
    alignItems: "center",
    width: "23%",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.small,
    ...SHADOWS.medium,
  },
  actionLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
});
