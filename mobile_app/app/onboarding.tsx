import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, { 
  FadeInDown, 
  FadeInUp,
  FadeInLeft 
} from "react-native-reanimated";
import { COLORS, SIZES } from "../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get('window');

const features = [
  {
    icon: "📊",
    title: "Portfolio Tracking",
    description: "Track your investments and analyze performance in real-time"
  },
  {
    icon: "🤖",
    title: "AI-Powered Analysis",
    description: "Get intelligent insights and recommendations for your investments"
  },
  {
    icon: "📈",
    title: "Market Updates",
    description: "Stay updated with real-time market trends and news"
  }
];

export default function Onboarding() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched !== null) {
        router.replace("/(tabs)");
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsLoading(false);
    }
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      router.replace("/(tabs)");
    } catch (error) {
      console.error('Error setting first launch:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo and Title Section */}
      <Animated.View 
        entering={FadeInDown.duration(1000).springify()}
        style={styles.headerContainer}
      >
        <Image
          source={require("../assets/favicon.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>FinAnalytiQ</Text>
        <Text style={styles.subtitle}>
          Your Smart Finance Assistant
        </Text>
      </Animated.View>

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <Animated.View
            key={index}
            entering={FadeInLeft.delay(500 + index * 200).springify()}
            style={styles.featureItem}
          >
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* Button Section */}
      <Animated.View 
        entering={FadeInUp.delay(1200).springify()}
        style={styles.buttonContainer}
      >
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.medium,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: height * 0.1,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: "contain",
  },
  title: {
    fontSize: SIZES.xxLarge,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: SIZES.medium,
    fontFamily: "Roboto-Bold",
  },
  subtitle: {
    fontSize: SIZES.large,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SIZES.small,
    fontFamily: "Roboto-Regular",
  },
  featuresContainer: {
    marginTop: height * 0.08,
    gap: SIZES.medium,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  featureIcon: {
    fontSize: SIZES.xLarge,
    marginRight: SIZES.medium,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.xSmall,
    fontFamily: "Roboto-Bold",
  },
  featureDescription: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontFamily: "Roboto-Regular",
  },
  buttonContainer: {
    position: "absolute",
    bottom: height * 0.05,
    left: SIZES.medium,
    right: SIZES.medium,
    alignItems: "center",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xxLarge,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.large,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
  },
  disclaimer: {
    marginTop: SIZES.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontFamily: "Roboto-Regular",
  },
});
