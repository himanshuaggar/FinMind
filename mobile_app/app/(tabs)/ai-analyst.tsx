import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, StyleSheet } from 'react-native';
import NewsAnalysis from '../../components/ai-analyst/NewsAnalysis';
import ReportAnalysis from '../../components/ai-analyst/ReportAnalysis';
import MarketSentiment from '../../components/ai-analyst/MarketSentiment';
import { COLORS } from '../../constants/theme';

const Tab = createMaterialTopTabNavigator();

export default function AIAnalyst() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Analyst</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    padding: 16,
    textAlign: 'center',
  },
});
