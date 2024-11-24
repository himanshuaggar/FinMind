import { useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Input from '../common/Input';
import Select from '../common/Select';
import { analyzeFinancialReports } from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

const ANALYSIS_TYPES = {
  "Financial Metrics Analysis": {
    template: `Analyze the following financial metrics:
1. Revenue and Growth
2. Profit Margins
3. ROE and ROA
4. Debt to Equity Ratio
5. Working Capital
Please provide specific numbers and year-over-year comparisons.`
  },
  "Risk Assessment": {
    template: `Analyze the company's risk profile considering:
1. Market risks and volatility
2. Operational risks
3. Financial risks
4. Strategic risks
5. External risk factors`
  },
  "Market Trends": {
    template: `Analyze current market trends focusing on:
1. Industry growth patterns
2. Market share dynamics
3. Consumer behavior shifts
4. Technological disruptions
5. Competitive landscape changes`
  },
  "Competitive Analysis": {
    template: `Provide a competitive analysis covering:
1. Market position
2. Competitive advantages
3. Peer comparison
4. Strategic initiatives
5. Market share analysis`
  },
  "Regulatory Compliance": {
    template: `Evaluate regulatory compliance status:
1. Current regulatory status
2. Upcoming regulatory changes
3. Compliance costs
4. Industry standards
5. Risk mitigation measures`
  },
  "Investment Opportunities": {
    template: `Assess investment potential considering:
1. Growth potential
2. Valuation metrics
3. Risk-return profile
4. Market opportunities
5. Investment timeline`
  },
  "Custom Query": {
    template: ''
  }
};

export default function ReportAnalysis() {
  const [files, setFiles] = useState<DocumentPicker.DocumentResult[]>([]);
  const [analysisType, setAnalysisType] = useState('Financial Metrics Analysis');
  const [query, setQuery] = useState(ANALYSIS_TYPES['Financial Metrics Analysis'].template);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
      });

      if (!result.canceled) {
        setFiles(prev => [...prev, ...result.assets]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const handleAnalysisTypeChange = (type: string) => {
    setAnalysisType(type);
    if (type !== 'Custom Query') {
      setQuery(ANALYSIS_TYPES[type].template);
    } else {
      setQuery('');
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: 'application/pdf'
        } as any);
      });

      formData.append('query', query);
      formData.append('analysis_type', analysisType);

      const response = await analyzeFinancialReports(formData);
      setResult(response.result);
      setSources(response.sources || []);
    } catch (error) {
      console.error('Error analyzing reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.introCard}>
        <Text style={styles.title}>Financial Report Analysis</Text>
        <Text style={styles.description}>
          Upload financial reports and select an analysis type to get detailed insights.
        </Text>
      </Card>

      <Button
        title="Upload PDF Reports"
        onPress={pickDocument}
        variant="secondary"
        icon="document-text"
      />

      {files.length > 0 && (
        <Card style={styles.filesCard}>
          <Text style={styles.filesTitle}>Selected Reports:</Text>
          {files.map((file, index) => (
            <Text key={index} style={styles.fileName}>
              {file.name}
            </Text>
          ))}
        </Card>
      )}

      <Select
        label="Analysis Type"
        value={analysisType}
        onValueChange={handleAnalysisTypeChange}
        items={Object.keys(ANALYSIS_TYPES).map(type => ({
          label: type,
          value: type
        }))}
      />

      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={analysisType === 'Custom Query' ?
          "Enter your analysis question" :
          "Modify the template or keep as is"}
        multiline
        numberOfLines={6}
        label="Analysis Query"
      />

      <Button
        title="Analyze Reports"
        onPress={handleAnalyze}
        disabled={files.length === 0 || !query.trim()}
        loading={loading}
        icon="analytics"
      />

      {loading && <Loading />}

      {result && (
        <Card style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analysis Results</Text>
          <Text style={styles.resultText}>{result}</Text>

          {sources.length > 0 && (
            <View style={styles.sourcesContainer}>
              <Text style={styles.sourcesTitle}>Sources:</Text>
              {sources.map((source, index) => (
                <Text key={index} style={styles.sourceText}>
                  • {source}
                </Text>
              ))}
            </View>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  introCard: {
    padding: SIZES.small,
    margin: SIZES.small,
    marginBottom: SIZES.small,
    backgroundColor: COLORS.cardBackground,
  },
  title: {
    fontSize: SIZES.xLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  description: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    lineHeight: SIZES.large * 1.2,
  },
  filesCard: {
    padding: SIZES.medium,
    margin: SIZES.medium,
  },
  filesTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.small,
  },
  fileName: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xSmall,
  },
  resultCard: {
    padding: SIZES.medium,
    margin: SIZES.medium,
  },
  resultTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  resultText: {
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    lineHeight: SIZES.large * 1.2,
  },
  sourcesContainer: {
    marginTop: SIZES.medium,
    paddingTop: SIZES.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sourcesTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.small,
  },
  sourceText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xSmall,
  }
});
