import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider } from "./contexts/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./navigation/AppNavigator";
import { COLORS } from "./constants/theme";
import { app } from "./config/firebase";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [fontsLoaded] = useFonts({
    "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Medium": require("./assets/fonts/Roboto-Medium.ttf"),
    "Roboto-Bold": require("./assets/fonts/Roboto-Bold.ttf"),
    "Roboto-Light": require("./assets/fonts/Roboto-Light.ttf"),
    "Roboto-Thin": require("./assets/fonts/Roboto-Thin.ttf"),
    "Roboto-Black": require("./assets/fonts/Roboto-Black.ttf"),
    "Roboto-Italic": require("./assets/fonts/Roboto-Italic.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize Firebase
        await app;
        setFirebaseInitialized(true);

        // Pre-load fonts, make any API calls you need to do here
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn("Error during app initialization:", e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && fontsLoaded && firebaseInitialized) {
      // This tells the splash screen to hide immediately
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded, firebaseInitialized]);

  if (!appIsReady || !fontsLoaded || !firebaseInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <UserProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor={COLORS.background} />
            <View style={{ flex: 1, backgroundColor: COLORS.background }}>
              <AppNavigator />
            </View>
          </NavigationContainer>
        </UserProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
} 