import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../constants/theme";
import { router } from "expo-router";

const MarketEducation = ({ lesson, onPress }) => {
  const handlePress = () => {
    if (lesson.contentUrl) {
      router.push(`/webview?url=${encodeURIComponent(lesson.contentUrl)}`);
    } else {
      onPress();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: lesson.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{lesson.category}</Text>
          <Text style={styles.duration}>{lesson.duration} min read</Text>
        </View>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {lesson.description}
        </Text>
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { width: `${lesson.progress}%` }]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.small,
    overflow: "hidden",
    marginBottom: SIZES.medium,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  content: {
    padding: SIZES.medium,
  },
  tagContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.xSmall,
  },
  tag: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: "600",
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: SIZES.small,
    paddingVertical: 4,
    borderRadius: SIZES.xSmall,
  },
  duration: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    fontWeight: "500",
  },
  title: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SIZES.xSmall,
    lineHeight: 24,
  },
  description: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.medium,
    lineHeight: 20,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.background,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
    marginTop: SIZES.xSmall,
    textAlign: "right",
  },
});

export default MarketEducation;
