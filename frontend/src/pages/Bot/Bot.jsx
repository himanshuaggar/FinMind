import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import SideNav from '../../components/SideNav';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ReactMarkdown from 'react-markdown';

const Bot = () => {
  const [symbol, setSymbol] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch stock recommendation and detailed advice
      const response = await fetch(`http://localhost:8000/stock-recommendation/${symbol}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to fetch stock analysis');

      const data = await response.json();
      console.log("data",data)
      setAnalysis(data); // Assuming the response structure matches
      console.log(analysis)
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
                    disabled={!symbol || loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Analyze'}
                  </Button>
                </Box>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
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
                      <strong>Symbol:</strong> {symbol}
                    </Typography>
                    <Typography>
                      <strong>Latest Price:</strong> ₹{analysis.latest_price}
                    </Typography>
                    <Typography>
                      <strong>Recommendation:</strong> {analysis.advice}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Fundamentals
                    </Typography>
                    {analysis.fundamentals ? (
                      Object.entries(analysis.fundamentals).map(([key, value]) => (
                        <Typography key={key}>
                          <strong>{key}:</strong> {value}
                        </Typography>
                      ))
                    ) : (
                      <Typography>No fundamentals data available.</Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Detailed Analysis
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    <ReactMarkdown>{analysis.advice}</ReactMarkdown>
                  </Paper>
                </Grid>

                {/* Stock Price Trend Graph */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Stock Price Trend
                    </Typography>
                    <LineChart
                      width={600}
                      height={300}
                      data={analysis.price_trend || []} // Use historical data for the chart
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="price" stroke="#8884d8" />
                    </LineChart>
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