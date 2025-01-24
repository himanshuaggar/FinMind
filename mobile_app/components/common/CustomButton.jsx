import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/theme";

const getBgVariantStyle = (variant) => {
  switch (variant) {
    case "secondary":
      return styles.bgSecondary;
    case "danger":
      return styles.bgDanger;
    case "success":
      return styles.bgSuccess;
    case "outline":
      return styles.bgOutline;
    default:
      return styles.bgPrimary;
  }
};

const getTextVariantStyle = (variant) => {
  switch (variant) {
    case "primary":
      return styles.textPrimary;
    case "secondary":
      return styles.textSecondary;
    case "danger":
      return styles.textDanger;
    case "success":
      return styles.textSuccess;
    default:
      return styles.textDefault;
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, getBgVariantStyle(bgVariant), style]}
      {...props}
    >
      {IconLeft && <IconLeft />}
      <Text style={[styles.text, getTextVariantStyle(textVariant)]}>
        {title}
      </Text>
      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 9999,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 18,
    fontFamily: "Roboto-Bold",
    color: "white",
  },
  bgPrimary: {
    backgroundColor: "#0286FF",
  },
  bgSecondary: {
    backgroundColor: "#6B7280",
  },
  bgDanger: {
    backgroundColor: "#EF4444",
  },
  bgSuccess: {
    backgroundColor: "#22C55E",
  },
  bgOutline: {
    backgroundColor: "transparent",
    borderColor: "#D4D4D4",
    borderWidth: 0.5,
  },
  // Text variants
  textPrimary: {
    color: "#000000",
  },
  textSecondary: {
    color: "#F3F4F6",
  },
  textDanger: {
    color: "#FEE2E2", // red-100
  },
  textSuccess: {
    color: "#DCFCE7", // green-100
  },
  textDefault: {
    color: "#FFFFFF",
  },
});

export default CustomButton;
