import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { NEWS_CATEGORIES } from '../../constants/config';
import { NewsCategory } from '../../types/news';

interface NewsFilterProps {
    selectedCategory: NewsCategory;
    onSelectCategory: (category: NewsCategory) => void;
}

const NewsFilter = ({ selectedCategory, onSelectCategory }: NewsFilterProps) => {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {NEWS_CATEGORIES.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category.id && styles.selectedCategory,
                        ]}
                        onPress={() => onSelectCategory(category.id as NewsCategory)}
                    >
                        <MaterialIcons
                            name={category.icon as keyof typeof MaterialIcons.glyphMap}
                            size={20}
                            color={selectedCategory === category.id ? COLORS.white : COLORS.primary}
                            style={styles.icon}
                        />
                        <Text
                            style={[
                                styles.categoryText,
                                selectedCategory === category.id && styles.selectedCategoryText,
                            ]}
                        >
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.cardBackground,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    content: {
        padding: SIZES.medium,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.medium,
        paddingVertical: SIZES.small,
        borderRadius: SIZES.small,
        marginRight: SIZES.small,
        backgroundColor: COLORS.background,
    },
    selectedCategory: {
        backgroundColor: COLORS.primary,
    },
    icon: {
        marginRight: SIZES.xSmall,
    },
    categoryText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        fontWeight: '600',
    },
    selectedCategoryText: {
        color: COLORS.white,
    },
});

export default NewsFilter;