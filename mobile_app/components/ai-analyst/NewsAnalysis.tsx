import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { analyzeNews } from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';
import Loading from '../common/Loading';

export default function NewsAnalysis() {
  const [urls, setUrls] = useState('');
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!urls.trim()) return;

    try {
      setLoading(true);
      const urlList = urls.split('\n').filter(url => url.trim());
      const result = await analyzeNews(urlList, query);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>News URLs (one per line)</Text>
        <TextInput
          style={styles.urlInput}
          multiline
          value={urls}
          onChangeText={setUrls}
          placeholder="Enter news article URLs..."
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>Analysis Query (optional)</Text>
        <TextInput
          style={styles.queryInput}
          value={query}
          onChangeText={setQuery}
          placeholder="What would you like to know about these articles?"
          placeholderTextColor={COLORS.textSecondary}
        />

        <TouchableOpacity 
          style={styles.analyzeButton}
          onPress={handleAnalyze}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Analyzing...' : 'Analyze News'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && <Loading />}

      {analysis && (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>Analysis Results</Text>
          <Text style={styles.analysisText}>{analysis.result}</Text>
          
          {analysis.sources && (
            <View style={styles.sourcesContainer}>
              <Text style={styles.sourcesTitle}>Sources</Text>
              {analysis.sources.map((source, index) => (
                <Text key={index} style={styles.sourceText}>
                  {source.title || source.url}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inputContainer: {
    padding: SIZES.medium,
  },
  // ... more styles
});
