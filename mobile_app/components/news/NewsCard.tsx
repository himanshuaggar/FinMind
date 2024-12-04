import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { NewsItem } from '../../types/news';

interface NewsCardProps {
  news: NewsItem;
  onPress: () => void;
}

const NewsCard = ({ news, onPress }: NewsCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {news.imageUrl && (
        <Image
          source={{ uri: news.imageUrl }}
          style={styles.image}
          defaultSource={require('../../assets/images/no-result.png')}
        />
      )}
      <View style={styles.content}>
        <Text style={styles.source}>{news.source}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {news.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {news.description}
        </Text>
        <Text style={styles.date}>
          {new Date(news.publishedAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.small,
    marginBottom: SIZES.medium,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: SIZES.medium,
  },
  source: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginBottom: SIZES.xSmall,
  },
  title: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xSmall,
  },
  description: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.small,
  },
  date: {
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
  },
});

export default NewsCard;