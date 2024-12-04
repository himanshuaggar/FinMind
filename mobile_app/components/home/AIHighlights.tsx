import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../constants/theme";
import { useEffect, useState } from 'react';
import { getAIInsights } from '../../services/api';

interface MarketTrend {
  direction: 'up' | 'down' | 'neutral';
  percentage: number;
  sector: string;
  analysis: string;
}

interface MarketInsight {
  category: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  icon: string;
}

interface MarketData {
  topInsights: MarketInsight[];
  marketTrends: MarketTrend[];
  lastUpdated: string;
  marketSummary: string;
  tradingVolume: number;
  volatilityIndex: number;
}

interface AIHighlightsProps {
  onPress: () => void;
}

export default function AIHighlights({ onPress }: AIHighlightsProps) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      const marketData = await getAIInsights();
      setData(marketData);
    } catch (err) {
      setError('Failed to load market data. Please try again later.');
      console.error('Error loading market data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadMarketData, 300000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return 'arrow-up';
      case 'down': return 'arrow-down';
      default: return 'minus';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return COLORS.success;
      case 'down': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return COLORS.success;
      case 'negative': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  if (loading && !data) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading market insights...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <FontAwesome5 name="exclamation-circle" size={24} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMarketData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) return null;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.header}>
          <FontAwesome5 name="robot" size={24} color={COLORS.primary} />
          <Text style={styles.title}>AI Market Insights</Text>
          {loading && (
            <ActivityIndicator size="small" color={COLORS.primary} />
          )}
        </View>

        {/* Market Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>{data.marketSummary}</Text>
          <View style={styles.marketMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Trading Volume</Text>
              <Text style={styles.metricValue}>
                ${(data.tradingVolume / 1000000).toFixed(2)}M
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>VIX</Text>
              <View style={styles.vixContainer}>
                <Text style={[
                  styles.metricValue,
                  { color: data.volatilityIndex > 20 ? COLORS.error : COLORS.success }
                ]}>
                  {data.volatilityIndex.toFixed(2)}
                </Text>
                <Text style={styles.vixLabel}>
                  {data.volatilityIndex > 30 ? 'High' : 
                   data.volatilityIndex > 20 ? 'Elevated' : 'Normal'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Market Trends */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sector Performance</Text>
          {data.marketTrends.map((trend, index) => (
            <View key={index}>
              <View style={styles.trendItem}>
                <FontAwesome5
                  name={getTrendIcon(trend.direction)}
                  size={16}
                  color={getTrendColor(trend.direction)}
                />
                <Text style={styles.sectorName}>{trend.sector}</Text>
                <Text style={[styles.trendValue, { color: getTrendColor(trend.direction) }]}>
                  {trend.direction === 'up' ? '+' : ''}{trend.percentage.toFixed(2)}%
                </Text>
              </View>
              <Text style={styles.trendAnalysis}>{trend.analysis}</Text>
            </View>
          ))}
        </View>

        {/* Key Insights */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {data.topInsights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <View style={styles.insightHeader}>
                <FontAwesome5
                  name={insight.icon}
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.insightCategory}>{insight.category}</Text>
                <View style={[styles.confidenceBadge, { backgroundColor: getImpactColor(insight.impact) + '20' }]}>
                  <Text style={[styles.confidenceText, { color: getImpactColor(insight.impact) }]}>
                    {insight.confidence}% confidence
                  </Text>
                </View>
              </View>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </Text>
          {loading && <ActivityIndicator size="small" color={COLORS.primary} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: SIZES.small,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    gap: SIZES.small,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SIZES.small,
    padding: SIZES.small,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.small,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.medium,
    gap: SIZES.small,
  },
  title: {
    flex: 1,
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  summaryContainer: {
    marginBottom: SIZES.medium,
    padding: SIZES.small,
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.small,
  },
  summaryText: {
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    lineHeight: SIZES.large * 1.2,
  },
  marketMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.small,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  vixContainer: {
    alignItems: 'center',
  },
  vixLabel: {
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
  },
  sectionContainer: {
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.small,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.xSmall,
    gap: SIZES.small,
  },
  sectorName: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
  },
  trendValue: {
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  trendAnalysis: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginLeft: SIZES.xxLarge,
    marginBottom: SIZES.small,
  },
  insightItem: {
    marginBottom: SIZES.small,
    padding: SIZES.small,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.small,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xSmall,
    gap: SIZES.small,
  },
  insightCategory: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  insightTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xSmall,
  },
  confidenceBadge: {
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.xSmall / 2,
    borderRadius: SIZES.small,
    marginLeft: 'auto',
  },
  confidenceText: {
    fontSize: SIZES.small,
    fontWeight: '500',
  },
  insightDescription: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: SIZES.medium * 1.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
});