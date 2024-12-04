import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

interface NewsItemProps {
    item: {
        id: string;
        title: string;
        description: string;
        category: string;
        imageUrl: string;
        source: string;
        sourceIcon: string;
        timeAgo: string;
        impact: 'positive' | 'negative' | 'neutral';
        relatedStocks?: string[];
        marketImpact?: {
            description: string;
            percentage: string;
        };
    };
    onPress: () => void;
}

const NewsItem = ({ item, onPress }: NewsItemProps) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.sourceContainer}>
                        <Image
                            source={{ uri: item.sourceIcon }}
                            style={styles.sourceIcon}
                        />
                        <Text style={styles.sourceName}>{item.source}</Text>
                    </View>
                    <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                </View>

                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.impactContainer}>
                        <MaterialIcons
                            name={item.impact === 'positive' ? 'trending-up' : 'trending-down'}
                            size={16}
                            color={item.impact === 'positive' ? COLORS.success : COLORS.error}
                        />
                        <Text
                            style={[
                                styles.impactText,
                                { color: item.impact === 'positive' ? COLORS.success : COLORS.error }
                            ]}
                        >
                            {item.marketImpact?.percentage}
                        </Text>
                    </View>

                    {item.relatedStocks && (
                        <View style={styles.stocksContainer}>
                            {item.relatedStocks.map((stock, index) => (
                                <View key={stock} style={styles.stockTag}>
                                    <Text style={styles.stockText}>{stock}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: SIZES.small,
        overflow: 'hidden',
        marginBottom: SIZES.medium,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 200,
    },
    content: {
        padding: SIZES.medium,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.small,
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sourceIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: SIZES.xSmall,
    },
    sourceName: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    timeAgo: {
        fontSize: SIZES.xSmall,
        color: COLORS.textSecondary,
    },
    title: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SIZES.small,
        lineHeight: 24,
    },
    description: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginBottom: SIZES.medium,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    impactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: SIZES.small,
        paddingVertical: 4,
        borderRadius: SIZES.xSmall,
    },
    impactText: {
        fontSize: SIZES.small,
        fontWeight: '600',
        marginLeft: 4,
    },
    stocksContainer: {
        flexDirection: 'row',
        gap: SIZES.xSmall,
    },
    stockTag: {
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: SIZES.small,
        paddingVertical: 4,
        borderRadius: SIZES.xSmall,
    },
    stockText: {
        fontSize: SIZES.xSmall,
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default NewsItem;