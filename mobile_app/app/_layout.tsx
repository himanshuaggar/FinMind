import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "../constants/theme";
import { UserProvider } from "../contexts/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClerkProvider, useAuth, ClerkLoaded } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import { Slot } from 'expo-router'
import * as SecureStore from 'expo-secure-store'


// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error('Missing Publishable Key')
}

export default function RootLayout() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const router = useRouter();
  const tokenCache = {
    async getToken(key: string) {
      try {
        const item = await SecureStore.getItemAsync(key)
        if (item) {
          console.log(`${key} was used 🔐 \n`)
        } else {
          console.log('No values stored under key: ' + key)
        }
        return item
      } catch (error) {
        console.error('SecureStore get item error: ', error)
        await SecureStore.deleteItemAsync(key)
        return null
      }
    },
    async saveToken(key: string, value: string) {
      try {
        return SecureStore.setItemAsync(key, value)
      } catch (err) {
        return
      }
    },
  }

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
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isFirstLaunch]);

  if (!fontsLoaded || isFirstLaunch === null) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <UserProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="light" />
          <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <Stack
              initialRouteName={isFirstLaunch ? "(auth)/welcome" : "(tabs)"}
              screenOptions={{
                headerStyle: {
                  backgroundColor: COLORS.background,
                },
                headerTintColor: COLORS.textPrimary,
                headerTitleStyle: {
                  fontFamily: "Roboto-Bold",
                },
                contentStyle: {
                  backgroundColor: COLORS.background,
                },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="(auth)"
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
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
              {/* Remove or add the modal route as needed */}
              {/* <Stack.Screen
                name="modal"
                options={{
                  presentation: "modal",
                  headerStyle: {
                    backgroundColor: COLORS.background,
                  },
                  headerTintColor: COLORS.primary,
                  headerTitleStyle: {
                    fontFamily: "Roboto-Medium",
                  },
                }}
              /> */}
            </Stack>
          </SafeAreaView>
        </GestureHandlerRootView>
      </UserProvider>
    </ClerkProvider>
  );
}


