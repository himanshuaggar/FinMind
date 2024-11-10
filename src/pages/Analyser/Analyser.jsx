import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { CloudUpload, Link as LinkIcon, Analytics } from '@mui/icons-material';
import SideNav from '../../components/SideNav';

const Analyser = () => {
  const [urls, setUrls] = useState(['', '', '']);
  const [files, setFiles] = useState([]);
  const [analysisType, setAnalysisType] = useState('Financial Metrics Analysis');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);

  const analysisTypes = [
    "Financial Metrics Analysis",
    "Risk Assessment",
    "Market Trends",
    "Competitive Analysis",
    "Regulatory Compliance",
    "Investment Opportunities",
    "Custom Query"
  ];

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleAnalyze = async () => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('urls', JSON.stringify(urls.filter(url => url)));
    formData.append('analysis_type', analysisType);
    formData.append('query', query);

    try {
      const response = await fetch('http://localhost:8000/documents/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing documents:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            Financial Research Assistant
          </Typography>

          <Grid container spacing={3}>
            {/* URL Inputs */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <LinkIcon /> Financial News URLs
                </Typography>
                {urls.map((url, index) => (
                  <TextField
                    key={index}
                    fullWidth
                    label={`Financial News URL ${index + 1}`}
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    sx={{ mb: 2 }}
                  />
                ))}
              </Paper>
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <CloudUpload /> Upload Financial Documents
                </Typography>
                <Button
                  variant="contained"
                  component="label"
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
                {files.map((file, index) => (
                  <Typography key={index} variant="body2">
                    {file.name}
                  </Typography>
                ))}
              </Paper>
            </Grid>

            {/* Analysis Options */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <Analytics /> Analysis Configuration
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Analysis Type</InputLabel>
                  <Select
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                  >
                    {analysisTypes.map((type) => (
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
                />
                <Button
                  variant="contained"
                  onClick={handleAnalyze}
                  disabled={!files.length && !urls.some(url => url)}
                >
                  Analyze Documents
                </Button>
              </Paper>
            </Grid>

            {/* Results */}
            {result && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Analysis Results
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {result.analysis}
                  </Typography>
                  {result.sources?.length > 0 && (
                    <>
                      <Typography variant="h6" sx={{ mt: 2 }}>
                        Sources
                      </Typography>
                      {result.sources.map((source, index) => (
                        <Typography key={index} variant="body2">
                          • {source}
                        </Typography>
                      ))}
                    </>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Analyser;