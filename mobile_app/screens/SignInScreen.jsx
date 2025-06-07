import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import CustomButton from "../components/common/CustomButton";
import Input from "../components/common/Input";
import { COLORS, SIZES } from "../constants/theme";
import OAuth from "../components/common/OAuth";

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <View style={styles.form}>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <CustomButton
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
        />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.line} />
        </View>

        <OAuth />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.large,
  },
  title: {
    fontSize: SIZES.xxLarge,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginTop: SIZES.xxLarge,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.small,
  },
  form: {
    marginTop: SIZES.xLarge,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: SIZES.small,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZES.large,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.medium,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SIZES.large,
  },
  footerText: {
    color: COLORS.textSecondary,
  },
  signUpText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default SignInScreen;
