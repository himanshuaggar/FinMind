import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import StocksScreen from "../screens/StocksScreen";
import NewsScreen from "../screens/NewsScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import AIAnalystScreen from "../screens/AIAnalystScreen";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Stocks":
              iconName = focused ? "trending-up" : "trending-up-outline";
              break;
            case "News":
              iconName = focused ? "newspaper" : "newspaper-outline";
              break;
            case "Chatbot":
              iconName = focused ? "chatbubble" : "chatbubble-outline";
              break;
            case "AI Analyst":
              iconName = focused ? "analytics" : "analytics-outline";
              break;
            default:
              iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
        },
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.textPrimary,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stocks" component={StocksScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen name="AI Analyst" component={AIAnalystScreen} />
    </Tab.Navigator>
  );
}
