import { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Input from '../common/Input';

import { analyzeFinancialReports } from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

export default function ReportAnalysis() {
  const [files, setFiles] = useState<DocumentPicker.DocumentResult[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

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

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: 'application/pdf'
        } as any);
      });

      if (query) {
        formData.append('query', query);
      }

      const response = await analyzeFinancialReports(formData);
      setResult(response.result);
    } catch (error) {
      console.error('Error analyzing reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Pick PDF Reports" 
        onPress={pickDocument}
        variant="secondary"
      />

      {files.length > 0 && (
        <Card style={styles.filesCard}>
          <Text style={styles.filesTitle}>Selected Files:</Text>
          {files.map((file, index) => (
            <Text key={index} style={styles.fileName}>
              {file.name}
            </Text>
          ))}
        </Card>
      )}

      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Enter your analysis question"
        multiline
      />

      <Button
        title="Analyze Reports"
        onPress={handleAnalyze}
        disabled={files.length === 0}
        loading={loading}
      />

      {loading && <Loading />}

      {result && (
        <Card style={styles.resultCard}>
          <Text style={styles.resultText}>{result}</Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
    gap: SIZES.medium,
    backgroundColor: COLORS.background,
    height: "100%",
  },
  filesCard: {
    padding: SIZES.medium,
  },
  filesTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.small,
  },
  fileName: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  resultCard: {
    padding: SIZES.medium,
    marginTop: SIZES.medium,
  },
  resultText: {
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    lineHeight: SIZES.large * 1.2,
  },
});
