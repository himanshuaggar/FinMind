import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Alert, Image, Text, View, StyleSheet, Linking } from "react-native";
import CustomButton from "./CustomButton";
import { icons } from "../../constants";
import { googleOAuth } from "../../services/auth";
import { COLORS, SIZES } from "../../constants/theme";
import { useAuth } from "@clerk/clerk-expo";

const OAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { signOut } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      try {
        await signOut();
      } catch (e) {
        console.error("Sign out error:", e);
      }

      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "OAuth error");
      }
    } catch (err) {
      console.error("OAuth error:", err);
      Alert.alert("Error", "OAuth sign in failed");
    }
  };

  return (
    <View style={styles.container}>
      <CustomButton
        title="Continue with Google"
        onPress={handleGoogleSignIn}
        icon={<Image source={icons.google} style={styles.icon} />}
        variant="outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: SIZES.small,
  },
});

export default OAuth;
