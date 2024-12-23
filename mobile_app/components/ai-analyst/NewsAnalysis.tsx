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
      
      if (urlList.length === 0) {
        console.error('No valid URLs provided');
        return;
      }

      const result = await analyzeNews(urlList, query.trim() || undefined);
      console.log('Analysis result:', result); 
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>News Analysis</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>News URLs</Text>
          <Text style={styles.sublabel}>Enter one URL per line</Text>
          <TextInput
            style={[styles.input, styles.urlInput]}
            multiline
            value={urls}
            onChangeText={setUrls}
            placeholder="https://example.com/article"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={[styles.label, styles.spacingTop]}>Analysis Query</Text>
          <Text style={styles.sublabel}>What would you like to know about these articles?</Text>
          <TextInput
            style={[styles.input, styles.queryInput]}
            value={query}
            onChangeText={setQuery}
            placeholder="E.g., What are the highlights?"
            placeholderTextColor={COLORS.textSecondary}
          />

          <TouchableOpacity 
            style={[
              styles.analyzeButton,
              loading && styles.analyzeButtonDisabled
            ]}
            onPress={handleAnalyze}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Analyzing...' : 'Analyze News'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && <Loading style={styles.loader} />}

      {analysis && (
        <View style={styles.card}>
          <View style={styles.analysisContainer}>
            <Text style={styles.analysisTitle}>Analysis Results</Text>
            <Text style={styles.analysisText}>{analysis.result}</Text>
            
            {analysis.sources && analysis.sources.length > 0 && (
              <View style={styles.sourcesContainer}>
                <Text style={styles.sourcesTitle}>Sources</Text>
                {analysis.sources.map((source, index) => (
                  <View key={index} style={styles.sourceItem}>
                    <Text style={styles.sourceText}>
                      {index + 1}. {source.title || source.url}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: SIZES.xLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  inputContainer: {
    gap: SIZES.small,
  },
  label: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sublabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: -SIZES.small,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.small,
    padding: SIZES.small,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBackground,
  },
  urlInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  queryInput: {
    height: 50,
  },
  spacingTop: {
    marginTop: SIZES.medium,
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    alignItems: 'center',
    marginTop: SIZES.medium,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  loader: {
    marginVertical: SIZES.medium,
  },
  analysisContainer: {
    gap: SIZES.medium,
  },
  analysisTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  analysisText: {
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  sourcesContainer: {
    marginTop: SIZES.medium,
    gap: SIZES.small,
  },
  sourcesTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sourceItem: {
    paddingVertical: SIZES.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sourceText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
});
