import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import MainNavigator from "./MainNavigator";
import OnboardingScreen from "../screens/OnboardingScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import WebViewScreen from "../screens/WebViewScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched");
      if (hasLaunched === null) {
        await AsyncStorage.setItem("hasLaunched", "true");
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error("Error checking first launch:", error);
      setIsFirstLaunch(false);
    }
  };

  if (loading || isFirstLaunch === null) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Public Screens */}
      {isFirstLaunch && (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : (
        // Protected (Tab) Screens
        <Stack.Screen name="MainTabs" component={MainNavigator} />
      )}
      {/* Modal or additional screens */}
      <Stack.Screen
        name="WebView"
        component={WebViewScreen}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}
