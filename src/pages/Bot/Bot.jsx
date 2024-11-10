import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Typography, TextField, Button } from '@mui/material';
import { Search } from '@mui/icons-material';
import SideNav from '../../components/SideNav';

const Bot = () => {
  const [symbol, setSymbol] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    try {
      const response = await fetch('http://localhost:8000/stocks/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol })
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing stock:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            Stock Analysis Bot
          </Typography>

          <Grid container spacing={3}>
            {/* Stock Symbol Input */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <Search /> Enter Stock Symbol
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Stock Symbol (e.g., RELIANCE.NS)"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAnalyze}
                    disabled={!symbol}
                  >
                    Analyze
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Analysis Results */}
            {analysis && (
              <>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Stock Overview
                    </Typography>
                    <Typography>
                      <strong>Symbol:</strong> {analysis.symbol}
                    </Typography>
                    <Typography>
                      <strong>Latest Price:</strong> ₹{analysis.latest_price}
                    </Typography>
                    <Typography>
                      <strong>Recommendation:</strong> {analysis.recommendation}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Fundamentals
                    </Typography>
                    {Object.entries(analysis.fundamentals).map(([key, value]) => (
                      <Typography key={key}>
                        <strong>{key}:</strong> {value}
                      </Typography>
                    ))}
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Detailed Analysis
                    </Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                      {analysis.detailed_advice}
                    </Typography>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Bot;