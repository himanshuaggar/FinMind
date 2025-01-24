import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { COLORS, SIZES } from "../../constants/theme";
import { router } from "expo-router";

const FinancialTerms = ({ terms, onPress }) => {
  const handlePress = (term) => {
    if (term.contentUrl) {
      router.push(`/webview?url=${encodeURIComponent(term.contentUrl)}`);
    } else {
      onPress(term);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Terms</Text>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {terms.map((term, index) => (
          <TouchableOpacity
            key={index}
            style={styles.termCard}
            onPress={() => handlePress(term)}
          >
            <Text style={styles.termTitle}>{term.term}</Text>
            <Text style={styles.termDescription} numberOfLines={2}>
              {term.definition}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.small,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  title: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  termCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    marginRight: SIZES.small,
    width: 200,
  },
  termTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  termDescription: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
});

export default FinancialTerms;
