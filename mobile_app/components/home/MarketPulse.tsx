import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../constants/theme";

export default function MarketPulse({ data, onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <FontAwesome5 name="chart-line" size={24} color={COLORS.primary} />
                    <Text style={styles.title}>Market Pulse</Text>
                </View>

                <View style={styles.trendsContainer}>
                    {data?.trends?.map((trend, index) => (
                        <View key={index} style={styles.trendItem}>
                            <View style={styles.trendHeader}>
                                <Text style={styles.trendTitle}>{trend.sector}</Text>
                                <Text style={[styles.trendChange,
                                { color: trend.change >= 0 ? COLORS.success : COLORS.tertiary }]}>
                                    {trend.change >= 0 ? '+' : ''}{trend.change}%
                                </Text>
                            </View>
                            <Text style={styles.aiAnalysis}>{trend.aiAnalysis}</Text>
                        </View>
                    ))}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.medium,
        gap: SIZES.small,
    },
    title: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    trendsContainer: {
        gap: SIZES.medium,
    },
    trendItem: {
        gap: SIZES.xSmall,
    },
    trendHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    trendTitle: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    trendChange: {
        fontSize: SIZES.medium,
        fontWeight: '600',
    },
    aiAnalysis: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
});