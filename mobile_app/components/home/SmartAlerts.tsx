import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../constants/theme";

export default function SmartAlerts({ alerts, onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <FontAwesome5 name="bell" size={24} color={COLORS.primary} />
                    <Text style={styles.title}>Smart Alerts</Text>
                </View>

                <View style={styles.alertsContainer}>
                    {alerts?.map((alert, index) => (
                        <View key={index} style={styles.alertItem}>
                            <View style={[styles.priorityIndicator,
                            { backgroundColor: getPriorityColor(alert.priority) }]}
                            />
                            <View style={styles.alertContent}>
                                <Text style={styles.alertTitle}>{alert.title}</Text>
                                <Text style={styles.alertDescription}>{alert.description}</Text>
                                <Text style={styles.timestamp}>{alert.timestamp}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
        case 'high':
            return COLORS.tertiary;
        case 'medium':
            return COLORS.warning;
        default:
            return COLORS.success;
    }
};

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
    alertsContainer: {
        gap: SIZES.small,
    },
    alertItem: {
        flexDirection: 'row',
        gap: SIZES.small,
    },
    priorityIndicator: {
        width: 4,
        borderRadius: SIZES.small,
    },
    alertContent: {
        flex: 1,
        gap: SIZES.xSmall,
    },
    alertTitle: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    alertDescription: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    timestamp: {
        fontSize: SIZES.xSmall,
        color: COLORS.gray,
    },
});