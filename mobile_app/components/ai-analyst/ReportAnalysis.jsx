import { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { uploadFinancialReports, analyzeFinancialReports } from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

export default function ReportAnalysis() {

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

  const [currentStep, setCurrentStep] = useState(1);
    const [files, setFiles] = useState([]);
    const [analysisType, setAnalysisType] = useState('Financial Metrics Analysis');
    const [query, setQuery] = useState(ANALYSIS_TYPES['Financial Metrics Analysis'].template);
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('pending');
    const [result, setResult] = useState(null);
    const [sources, setSources] = useState([]);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isFileProcessed, setIsFileProcessed] = useState(false);


  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets) {
        console.log('Selected files:', result.assets);
        setFiles(result.assets);
        setError(null);
        setIsFileProcessed(false);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      setError('Failed to select document');
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const replaceFile = async (indexToReplace) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        setFiles(prev => prev.map((file, index) =>
          index === indexToReplace ? result.assets[0] : file
        ));
      }
    } catch (err) {
      setError('Failed to replace document');
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one PDF file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      const formData = new FormData();
      files.forEach((file, index) => {
        console.log('Adding file to FormData:', file);
        // formData.append('files', {
        //   uri: file.uri,
        //   type: 'application/pdf',
        //   name: file.name || `file${index}.pdf`
        // } as any);
        formData.append('files', {
          uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
          type: 'application/pdf',
          name: file.name || `file${index}.pdf`
        });
      });

      console.log('Uploading files...');
      const response = await uploadFinancialReports(formData);
      console.log('Upload response:', response);
      setUploadProgress(100);
      setIsFileProcessed(true);
      setError(null);
      setUploadStatus('success');
      setCurrentStep(2);
    } catch (error) {
      setUploadStatus('failed');
      setError(error.message || 'Failed to upload reports');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {

    if (!isFileProcessed) {
      const uploaded = await handleUpload();
      if (!uploaded) return;
    }

    if (!query.trim()) {
      setError('Please enter an analysis query');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Starting analysis...');
      const response = await analyzeFinancialReports({
        analysis_type: analysisType,
        question: query
      });
      console.log('Analysis response:', response);

      setResult(response.result);
      setSources(response.sources || []);
    } catch (error) {
      setError(error.message || 'Failed to analyze reports');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Button
        title={files.length > 0 ? "Add More Reports" : "Upload PDF Reports"}
        onPress={pickDocument}
        variant="secondary"
        icon="document-text"
      />

      {files.length > 0 && (
        <Card style={styles.filesCard}>
          <Text style={styles.filesTitle}>Selected Reports:</Text>
          {files.map((file, index) => (
            <View key={index} style={styles.fileRow}>
              <Text style={styles.fileName}>{file.name || `File ${index + 1}`}</Text>
              <View style={styles.fileActions}>
                <TouchableOpacity onPress={() => replaceFile(index)}>
                  {/* <Icon name="reload" size={20} color={COLORS.primary} /> */}
                  <Text>Reload</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeFile(index)}>
                  <Text>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>
      )}

      <Button
        title="Upload and Continue"
        onPress={handleUpload}
        disabled={files.length === 0 || loading}
        loading={loading}
        icon="cloud-upload"
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Select
        label="Analysis Type"
        value={analysisType}
        onValueChange={(value) => {
          setAnalysisType(value);
          setQuery(ANALYSIS_TYPES[value].template);
          setError(null);
        }}
        items={Object.keys(ANALYSIS_TYPES).map(type => ({
          label: type,
          value: type
        }))}
      />

      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={
          analysisType === 'Custom Query'
            ? "Enter your analysis question"
            : "Modify the template or keep as is"
        }
        multiline
        numberOfLines={6}
        label="Analysis Query"
      />

      <View style={styles.buttonRow}>
        <Button
          title="Back to Upload"
          onPress={() => setCurrentStep(1)}
          variant="secondary"
          icon="arrow-back"
        />
        <Button
          title="Analyze Reports"
          onPress={handleAnalyze}
          disabled={!query.trim() || loading}
          loading={loading}
          icon="analytics"
        />
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.introCard}>
        <Text style={styles.title}>Financial Report Analysis</Text>
        <Text style={styles.description}>
          Upload financial reports (PDF) and get AI-powered insights using Gemini.
        </Text>
      </Card>

      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      {currentStep === 1 ? renderStep1() : renderStep2()}

      {loading && (
        <Card style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {currentStep === 1 ? 'Uploading files...' : 'Analyzing reports...'}
          </Text>
        </Card>
      )}

      {result && !loading && (
        <Card style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analysis Results</Text>
          <Text style={styles.resultText}>{result}</Text>
          {sources.length > 0 && (
            <View>
              <Text style={styles.sourcesTitle}>Sources:</Text>
              {sources.map((source, index) => (
                <Text key={index} style={styles.sourceText}>{source}</Text>
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
  },
  errorCard: {
    backgroundColor: COLORS.error,
    padding: SIZES.small,
    margin: SIZES.small,
  },
  errorText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
  loadingCard: {
    padding: SIZES.medium,
    margin: SIZES.medium,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.small,
    color: COLORS.textSecondary,
    fontSize: SIZES.medium,
  },
  progressText: {
    marginTop: SIZES.xSmall,
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
  },
  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  fileActions: {
    flexDirection: 'row',
    gap: 16
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16
  }
});
