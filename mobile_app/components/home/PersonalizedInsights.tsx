import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../constants/theme";

export default function PersonalizedInsights({ insights, onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <FontAwesome5 name="lightbulb" size={24} color={COLORS.primary} />
                    <Text style={styles.title}>Personalized Insights</Text>
                </View>

                <View style={styles.insightsContainer}>
                    {insights?.map((insight, index) => (
                        <View key={index} style={styles.insightCard}>
                            <View style={styles.insightHeader}>
                                <FontAwesome5
                                    name={insight.icon}
                                    size={16}
                                    color={COLORS.primary}
                                />
                                <Text style={styles.insightCategory}>{insight.category}</Text>
                            </View>

                            <Text style={styles.insightTitle}>{insight.title}</Text>
                            <Text style={styles.insightDescription}>{insight.description}</Text>

                            <View style={styles.actionContainer}>
                                <Text style={styles.actionText}>Learn more</Text>
                                <FontAwesome5
                                    name="chevron-right"
                                    size={12}
                                    color={COLORS.primary}
                                />
                            </View>
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
    insightsContainer: {
        gap: SIZES.medium,
    },
    insightCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.small,
        padding: SIZES.medium,
        gap: SIZES.small,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.small,
    },
    insightCategory: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        fontWeight: '600',
    },
    insightTitle: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    insightDescription: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        lineHeight: SIZES.medium * 1.2,
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.xSmall,
        marginTop: SIZES.xSmall,
    },
    actionText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        fontWeight: '600',
    },
});