import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import NewsAnalysis from '../../components/ai-analyst/NewsAnalysis';
import ReportAnalysis from '../../components/ai-analyst/ReportAnalysis';
import MarketSentiment from '../../components/ai-analyst/MarketSentiment';
import { COLORS } from '../../constants/theme';

const Tab = createMaterialTopTabNavigator();

export default function AIAnalyst() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarIndicatorStyle: { backgroundColor: COLORS.primary },
        tabBarStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Tab.Screen name="News" component={NewsAnalysis} />
      <Tab.Screen name="Reports" component={ReportAnalysis} />
    </Tab.Navigator>
  );
}
