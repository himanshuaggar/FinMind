import { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Text } from "react-native";
import { useRouter } from "expo-router";
import { getNews } from "../../services/api";
import NewsCard from "../../components/news/NewsCard";
import NewsFilter from "../../components/news/NewsFilter";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { COLORS, SIZES } from "../../constants/theme";

export default function News() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadNews = async (category) => {
    try {
      setError("");
      const newsData = await getNews(category);
      setNews(newsData);
    } catch (err) {
      setError("Failed to load news. Please try again later.");
      console.error("Error loading news:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadNews(selectedCategory);
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews(selectedCategory);
  };

  const renderNewsItem = ({ item }) => (
    <NewsCard
      news={item}
      onPress={() =>
        router.push(`/webview?url=${encodeURIComponent(item.url)}`)
      }
    />
  );

  if (isLoading && !refreshing) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Latest News</Text>
      <NewsFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      {error ? (
        <ErrorMessage
          message={error}
          onRetry={() => loadNews(selectedCategory)}
        />
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.newsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    padding: 16,
    textAlign: "center",
  },
  newsList: {
    padding: SIZES.medium,
  },
});
