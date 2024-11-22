import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Input from '../common/Input';
import Button from '../common/Button';
import { analyzeNews } from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

export default function NewsAnalysis() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const filteredUrls = urls.filter(url => url.trim() !== '');
      const response = await analyzeNews(filteredUrls, query);
      setResult(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {urls.map((url, index) => (
        <Input
          key={index}
          value={url}
          onChangeText={(text) => {
            const newUrls = [...urls];
            newUrls[index] = text;
            setUrls(newUrls);
          }}
          placeholder="Enter news URL"
        />
      ))}
      <Button
        title="Add URL"
        onPress={() => setUrls([...urls, ''])}
        variant="secondary"
      />
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Enter your question"
        multiline
      />
      <Button
        title="Analyze News"
        onPress={handleAnalyze}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
    gap: SIZES.small,
    backgroundColor: COLORS.background,
    height: "100%",
  },
});
