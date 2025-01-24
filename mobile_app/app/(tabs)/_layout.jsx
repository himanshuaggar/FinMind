import { Tabs } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontFamily: "Roboto-Bold",
        },
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.gray2,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-analyst"
        options={{
          title: "AI Analyst",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="brain" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "Advisory",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="comments" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stocks"
        options={{
          title: "Stocks",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="chart-line" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="article" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
