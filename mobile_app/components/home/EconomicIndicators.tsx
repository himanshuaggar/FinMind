import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const EconomicIndicators = ({ indicators }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Economic Indicators</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {indicators.map((indicator, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name={indicator.icon} size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.indicatorName}>{indicator.name}</Text>
                        <Text style={styles.value}>{indicator.value}</Text>
                        <View style={styles.changeContainer}>
                            <MaterialIcons
                                name={indicator.trend === 'up' ? 'trending-up' : 'trending-down'}
                                size={16}
                                color={indicator.trend === 'up' ? COLORS.success : COLORS.error}
                            />
                            <Text
                                style={[
                                    styles.change,
                                    { color: indicator.trend === 'up' ? COLORS.success : COLORS.error }
                                ]}
                            >
                                {indicator.change}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: SIZES.medium,
    },
    title: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SIZES.medium,
        paddingHorizontal: SIZES.medium,
    },
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: SIZES.small,
        padding: SIZES.medium,
        marginRight: SIZES.small,
        marginLeft: SIZES.xSmall,
        width: 150,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.small,
    },
    indicatorName: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginBottom: SIZES.xSmall,
        fontWeight: '500',
    },
    value: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SIZES.xSmall,
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SIZES.xSmall,
    },
    change: {
        fontSize: SIZES.small,
        fontWeight: '600',
        marginLeft: SIZES.xSmall,
    },
    trendIcon: {
        marginRight: SIZES.xSmall,
    },
    neutralTrend: {
        color: COLORS.textSecondary,
    },
    scrollContainer: {
        paddingLeft: SIZES.medium,
        paddingRight: SIZES.xSmall,
    },
    firstCard: {
        marginLeft: SIZES.medium,
    },
    lastCard: {
        marginRight: SIZES.medium,
    },
});

export default EconomicIndicators;