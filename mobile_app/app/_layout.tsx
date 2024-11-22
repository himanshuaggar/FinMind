import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "../constants/theme";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
    'Roboto-Thin': require('../assets/fonts/Roboto-Thin.ttf'),
    'Roboto-Black': require('../assets/fonts/Roboto-Black.ttf'),
    'Roboto-Italic': require('../assets/fonts/Roboto-Italic.ttf'),
  });

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      setIsFirstLaunch(hasLaunched === null);
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(false);
    }
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isFirstLaunch !== null) {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    }
  }, [fontsLoaded, isFirstLaunch]);

  if (!fontsLoaded || isFirstLaunch === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar style="light" />
        <Stack
          initialRouteName="onboarding"
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontFamily: "Roboto-Bold",
              fontSize: 18,
            },
            headerTitleAlign: "center",
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: COLORS.lightWhite,
            },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="error"
            options={{
              title: "Error",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.primary,
              headerTitleStyle: {
                fontFamily: "Roboto-Medium",
              },
            }}
          />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}


