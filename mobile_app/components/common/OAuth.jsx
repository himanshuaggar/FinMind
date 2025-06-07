import { Alert, Image, Text, View, StyleSheet } from "react-native";
import CustomButton from "./CustomButton";
import { icons } from "../../constants";
import { COLORS, SIZES } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";

const OAuth = () => {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("OAuth error:", err);
      Alert.alert("Error", "Google sign in failed");
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
