import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import CustomButton from "../components/common/CustomButton";
import Input from "../components/common/Input";
import { COLORS, SIZES } from "../constants/theme";
import OAuth from "../components/common/OAuth";

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

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
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <CustomButton
          title="Sign Up"
          onPress={handleSignUp}
          loading={loading}
        />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.line} />
        </View>

        <OAuth />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.signInText}>Sign In</Text>
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
  signInText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default SignUpScreen;
