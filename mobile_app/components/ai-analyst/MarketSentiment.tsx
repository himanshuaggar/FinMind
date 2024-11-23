import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FontAwesome5 } from '@expo/vector-icons';
import { getMarketSentiment } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';

export default function MarketSentimentAnalysis() {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSentimentData();
  }, []);

  const loadSentimentData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMarketSentiment();
      setSentimentData(data);
    } catch (error) {
      setError('Failed to load market sentiment data');
      console.error('Error loading sentiment:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSentimentGauge = () => {
    const radius = 70;
    const circumference = radius * 2 * Math.PI;
    const fillPercentage = sentimentData?.overall || 0;
    const strokeDashoffset = circumference - (circumference * fillPercentage) / 100;

    return (
      <View style={styles.gaugeContainer}>
        <View style={styles.gauge}>
          <View style={styles.gaugeBackground} />
          <View 
            style={[
              styles.gaugeFill,
              { 
                backgroundColor: fillPercentage > 50 ? COLORS.success : COLORS.error,
                width: `${fillPercentage}%` 
              }
            ]} 
          />
          <Text style={styles.gaugeText}>{fillPercentage}%</Text>
        </View>
        <Text style={styles.gaugeLabel}>Overall Sentiment</Text>
      </View>
    );
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={loadSentimentData} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Market Sentiment</Text>
        <Text style={styles.headerSubtitle}>Updated {new Date(sentimentData?.lastUpdated).toLocaleTimeString()}</Text>
      </View>

      <View style={styles.card}>
        {renderSentimentGauge()}
        <View style={styles.statsContainer}>
          <View style={[styles.statItem, { backgroundColor: `${COLORS.success}15` }]}>
            <FontAwesome5 name="arrow-up" size={20} color={COLORS.success} />
            <Text style={styles.statLabel}>Bullish</Text>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {sentimentData?.bullish}%
            </Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: `${COLORS.error}15` }]}>
            <FontAwesome5 name="arrow-down" size={20} color={COLORS.error} />
            <Text style={styles.statLabel}>Bearish</Text>
            <Text style={[styles.statValue, { color: COLORS.error }]}>
              {sentimentData?.bearish}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Technical Indicators</Text>
        {sentimentData?.indicators.map((indicator, index) => (
          <View key={index} style={styles.indicatorItem}>
            <View style={styles.indicatorHeader}>
              <Text style={styles.indicatorName}>{indicator.name}</Text>
              <View style={[
                styles.signalBadge,
                { backgroundColor: indicator.signal === 'bullish' ? `${COLORS.success}15` : 
                                 indicator.signal === 'bearish' ? `${COLORS.error}15` : 
                                 `${COLORS.warning}15` }
              ]}>
                <Text style={[
                  styles.signalText,
                  { color: indicator.signal === 'bullish' ? COLORS.success :
                          indicator.signal === 'bearish' ? COLORS.error :
                          COLORS.warning }
                ]}>
                  {indicator.signal.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${indicator.value}%`,
                    backgroundColor: indicator.signal === 'bullish' ? COLORS.success :
                                   indicator.signal === 'bearish' ? COLORS.error :
                                   COLORS.warning }
                ]} 
              />
            </View>
            <Text style={styles.indicatorValue}>{indicator.value}%</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.medium,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.gray}20`,
  },
  headerTitle: {
    fontSize: SIZES.xLarge,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    margin: SIZES.medium,
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: SIZES.medium,
  },
  gauge: {
    height: 20,
    width: '100%',
    backgroundColor: `${COLORS.gray}20`,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  gaugeBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${COLORS.gray}20`,
  },
  gaugeFill: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 10,
  },
  gaugeText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  gaugeLabel: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.small,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.medium,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    marginHorizontal: SIZES.xSmall,
  },
  statLabel: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginVertical: SIZES.small,
  },
  statValue: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  indicatorItem: {
    marginBottom: SIZES.medium,
  },
  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  indicatorName: {
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  signalBadge: {
    paddingHorizontal: SIZES.small,
    paddingVertical: 4,
    borderRadius: SIZES.small,
  },
  signalText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: `${COLORS.gray}20`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  indicatorValue: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
});
