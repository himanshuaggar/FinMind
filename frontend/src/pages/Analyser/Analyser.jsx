import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';

const Analyser = () => {
  const [urls, setUrls] = useState(['']);
  const [files, setFiles] = useState([]);
  const [analysisType, setAnalysisType] = useState('Financial Metrics Analysis');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const queryTemplates = {
    "Financial Metrics Analysis": "Analyze the following financial metrics:\n1. Revenue and Growth\n2. Profit Margins\n3. ROE and ROA\n4. Debt-to-Equity Ratio\n5. Working Capital\nPlease provide specific numbers and year-over-year comparisons.",
    "Risk Assessment": "Identify and analyze:\n1. Key Business Risks\n2. Market Risks\n3. Financial Risks\n4. Operational Risks\n5. Regulatory Risks\nProvide specific examples and potential impact assessments.",
    "Market Trends": "Analyze the following market aspects:\n1. Industry Growth Trends\n2. Market Share Analysis\n3. Consumer Behavior Shifts\n4. Technology Impact\n5. Future Market Projections\nInclude specific data points and market statistics.",
    "Competitive Analysis": "Provide analysis of:\n1. Major Competitors\n2. Market Position\n3. Competitive Advantages\n4. Market Share Comparison\n5. Strategic Initiatives\nInclude specific competitor comparisons and market data.",
    "Regulatory Compliance": "Evaluate:\n1. Current Compliance Status\n2. Regulatory Requirements\n3. Recent/Upcoming Regulatory Changes\n4. Compliance Costs\n5. Potential Regulatory Risks\nHighlight specific regulations and their impact.",
    "Investment Opportunities": "Analyze:\n1. Growth Potential\n2. Investment Risks\n3. Valuation Metrics\n4. Market Opportunity\n5. Strategic Advantages\nProvide specific investment metrics and potential returns.",
    "Custom Query": "",
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleRemoveUrl = (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
  };

  const handleAnalyze = async () => {
    setError(null);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('urls', JSON.stringify(urls.filter(url => url)));
    formData.append('query', query);

    try {
      const response = await fetch('http://localhost:8000/document-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to analyze documents');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Document Analysis
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Financial News URLs
            </Typography>
            {urls.map((url, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label={`Financial News URL ${index + 1}`}
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  variant="outlined"
                />
                <IconButton onClick={() => handleRemoveUrl(index)} sx={{ ml: 1 }}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="contained"
              onClick={() => setUrls([...urls, ''])}
              sx={{ mb: 2 }}
            >
              Add URL
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Financial Documents
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ mb: 2 }}
            >
              Upload PDFs
              <input
                type="file"
                hidden
                multiple
                accept=".pdf"
                onChange={handleFileChange}
              />
            </Button>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Array.from(files).map((file, index) => (
                <Chip key={index} label={file.name} onDelete={() => {
                  const newFiles = Array.from(files).filter((_, i) => i !== index);
                  setFiles(newFiles);
                }} />
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Configuration
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="analysis-type-label">Analysis Type</InputLabel>
              <Select
                labelId="analysis-type-label"
                id="analysis-type"
                value={analysisType}
                label="Analysis Type"
                onChange={(e) => setAnalysisType(e.target.value)}
              >
                {Object.keys(queryTemplates).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ mb: 2 }}
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={!files.length && !urls.some(url => url)}
              sx={{ px: 4, py: 1 }}
            >
              Analyze Documents
            </Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {result && (
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                Analysis Results: {result.message}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analyser;