import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const onboardingData = [
  {
    id: "1",
    title: "AI-Powered Insights",
    description:
      "Personalized financial advice and market insights powered by advanced AI.",
    icon: (
      <MaterialCommunityIcons name="robot-excited" size={90} color="#FFB300" />
    ),
    bgColor: "#18181C",
    iconBg: "#23232A",
    accent: "#FFB300",
  },
  {
    id: "2",
    title: "Smart Portfolio",
    description:
      "Track and manage your investments with real-time analytics and updates.",
    icon: <FontAwesome5 name="chart-line" size={90} color="#2979FF" />,
    bgColor: "#18181C",
    iconBg: "#23232A",
    accent: "#2979FF",
  },
  {
    id: "3",
    title: "Your AI Advisor",
    description: "Chat with your AI financial advisor anytime, anywhere.",
    icon: (
      <MaterialCommunityIcons name="account-cash" size={90} color="#00C853" />
    ),
    bgColor: "#18181C",
    iconBg: "#23232A",
    accent: "#00C853",
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("hasLaunched", "true");
    navigation.navigate("SignIn");
  };

  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await finishOnboarding();
    }
  };

  const handleSkip = async () => {
    await finishOnboarding();
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.cardContainer, { width }]}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: item.bgColor,
            transform: [{ rotate: index % 2 === 0 ? "-3deg" : "3deg" }],
          },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: item.iconBg, borderColor: item.accent },
          ]}
        >
          {item.icon}
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
      <View style={styles.bottomRow}>
        <View style={styles.pagination}>
          {onboardingData.map((item, idx) => (
            <View
              key={item.id}
              style={[
                styles.paginationDot,
                idx === currentIndex && {
                  backgroundColor: onboardingData[currentIndex].accent,
                  width: 18,
                },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={[
            styles.arrowButton,
            { borderColor: onboardingData[currentIndex].accent },
          ]}
          onPress={handleNext}
        >
          <FontAwesome5
            name="arrow-right"
            size={22}
            color={onboardingData[currentIndex].accent}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6F3",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "85%",
    borderRadius: 32,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    borderWidth: 3,
  },
  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  description: {
    color: "#E0E0E0",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 8,
  },
  bottomRow: {
    width: "85%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 16,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#444",
    marginHorizontal: 4,
    transition: "width 0.2s",
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181C",
  },
  skipBtn: {
    position: "absolute",
    top: 48,
    right: 32,
    padding: 8,
  },
  skipText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "600",
  },
});
