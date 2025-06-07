import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../constants/theme";
import { useNavigation } from "@react-navigation/native";

const InvestmentIdeas = ({ ideas, onPress }) => {
  const navigation = useNavigation();

  const handlePress = (idea) => {
    if (idea.contentUrl) {
      navigation.navigate("WebView", { url: idea.contentUrl });
    } else {
      onPress(idea);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Investment Ideas</Text>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {ideas.map((idea, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => handlePress(idea)}
          >
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{idea.category}</Text>
            </View>
            <Text style={styles.ideaTitle}>{idea.title}</Text>
            <Text style={styles.description} numberOfLines={3}>
              {idea.description}
            </Text>
            <View style={styles.footer}>
              <Text style={styles.risk}>Risk: {idea.riskLevel}</Text>
              <Text style={styles.horizon}>{idea.timeHorizon}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.medium,
    paddingHorizontal: SIZES.medium,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    marginRight: SIZES.small,
    marginLeft: SIZES.xSmall,
    width: 280,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryTag: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: SIZES.small,
    paddingVertical: 4,
    borderRadius: SIZES.xSmall,
    alignSelf: "flex-start",
    marginBottom: SIZES.small,
  },
  categoryText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: "600",
  },
  ideaTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.small,
  },
  risk: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  horizon: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: "500",
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.small,
    paddingVertical: 4,
    borderRadius: SIZES.xSmall,
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
  riskHigh: {
    color: COLORS.error,
  },
  riskModerate: {
    color: COLORS.warning,
  },
  riskLow: {
    color: COLORS.success,
  },
  iconButton: {
    padding: SIZES.xSmall,
    borderRadius: SIZES.small,
    backgroundColor: COLORS.background,
  },
  bookmarkIcon: {
    position: "absolute",
    top: SIZES.small,
    right: SIZES.small,
  },
  shareIcon: {
    position: "absolute",
    top: SIZES.small,
    right: SIZES.large + SIZES.medium,
  },
});

export default InvestmentIdeas;
