import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { getAIInsights, getMarketOverview, getLatestAnalysis } from '../services/api';
import AIHighlights from "../components/home/AIHighlights";
import QuickActions from "../components/home/QuickActions";
import Loading from '../components/common/Loading';
import { COLORS, SIZES } from "../constants/theme";
import { LinearGradient } from 'expo-linear-gradient';
import FinancialTipCard from '../components/home/FinancialTipCard';
import FinancialTerms from '../components/home/FinancialTerms';
import MarketEducation from '../components/home/MarketEducation';
import EconomicIndicators from '../components/home/EconomicIndicators';
import InvestmentIdeas from '../components/home/InvestmentIdeas';
import {
  DAILY_FINANCIAL_TIP,
  FINANCIAL_TERMS,
  MARKET_LESSONS,
  ECONOMIC_INDICATORS,
  INVESTMENT_IDEAS,
} from '../constants/educationData';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [aiInsights, setAIInsights] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [financialTip, setFinancialTip] = useState(null);
  const [financialTerms, setFinancialTerms] = useState([]);
  const [marketLessons, setMarketLessons] = useState([]);
  const [economicIndicators, setEconomicIndicators] = useState([]);
  const [investmentIdeas, setInvestmentIdeas] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [insights, market, analysis] = await Promise.all([
        getAIInsights(),
        getMarketOverview(),
        getLatestAnalysis()
      ]);

      setFinancialTip(DAILY_FINANCIAL_TIP);
      setFinancialTerms(FINANCIAL_TERMS);
      setMarketLessons(MARKET_LESSONS);
      setEconomicIndicators(ECONOMIC_INDICATORS);
      setInvestmentIdeas(INVESTMENT_IDEAS);
      setAIInsights(insights);
      setMarketData(market);
      setLatestAnalysis(analysis);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={[COLORS.primary + '20', COLORS.background]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>
                {user?.displayName || user?.email || 'User'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Search')}
              >
                <MaterialIcons name="search" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <View style={styles.notificationBadge}>
                  <FontAwesome5 name="bell" size={24} color={COLORS.textPrimary} />
                  <View style={styles.badge} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <AIHighlights
            onPress={() => navigation.navigate('AIInsights')}
          />
          <QuickActions />
          <EconomicIndicators indicators={economicIndicators} />
          <Text style={styles.sectionTitle}>Market Education</Text>
          {marketLessons.map((lesson) => (
            <MarketEducation
              key={lesson.title}
              lesson={lesson}
              onPress={() => navigation.navigate('WebView', { url: lesson.contentUrl })}
            />
          ))}

          <InvestmentIdeas
            ideas={investmentIdeas}
            onPress={() => navigation.navigate('InvestmentIdeas')}
          />

          {financialTip && (
            <View>
              <Text style={styles.sectionTitle}>Learn & Grow</Text>
              <FinancialTipCard
                tip={financialTip}
                onPress={() => navigation.navigate('EducationTips')}
              />
            </View>
          )}

          <FinancialTerms
            terms={financialTerms}
            onPress={() => navigation.navigate('Glossary')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
  },
  greeting: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: SIZES.xLarge,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  notificationBadge: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: SIZES.small,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.small,
  },
  iconButton: {
    padding: SIZES.xSmall,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.cardBackground,
  },
  content: {
    padding: SIZES.medium,
    gap: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.small,
  },
  cardContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginBottom: SIZES.small,
  },
});

export default HomeScreen; 