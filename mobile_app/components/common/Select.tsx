import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SIZES } from '../../constants/theme';

interface SelectProps {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    items: Array<{ label: string; value: string }>;
}

export default function Select({ label, value, onValueChange, items }: SelectProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={value}
                    onValueChange={onValueChange}
                    style={styles.picker}
                >
                    {items.map((item) => (
                        <Picker.Item
                            key={item.value}
                            label={item.label}
                            value={item.value}
                            color={COLORS.primary}
                        />
                    ))}
                </Picker>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: SIZES.medium,
    },
    label: {
        fontSize: SIZES.medium,
        color: COLORS.textPrimary,
        marginBottom: SIZES.xSmall,
    },
    pickerContainer: {
        borderRadius: SIZES.small,
        backgroundColor: COLORS.cardBackground,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        color:COLORS.primary,
        backgroundColor: COLORS.cardBackground,
    },
});