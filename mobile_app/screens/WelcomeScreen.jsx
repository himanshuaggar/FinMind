import { View, Text, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants/theme";
import Button from "../components/common/Button";

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../assets/images/onboarding1.png")}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to Finance Analyzer</Text>
        <Text style={styles.subtitle}>
          Your AI-powered financial companion for smarter investment decisions
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Sign In"
          onPress={() => navigation.navigate("SignIn")}
          style={styles.button}
        />
        <Button
          title="Create Account"
          onPress={() => navigation.navigate("SignUp")}
          type="secondary"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.large,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "80%",
    height: 300,
    marginBottom: SIZES.xxLarge,
  },
  title: {
    fontSize: SIZES.xLarge,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SIZES.medium,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: SIZES.large,
  },
  buttonContainer: {
    gap: SIZES.medium,
    marginBottom: SIZES.large,
  },
  button: {
    width: "100%",
  },
});
