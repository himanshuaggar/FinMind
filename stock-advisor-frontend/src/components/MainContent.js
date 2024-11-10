import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Paper
} from '@mui/material';
import axios from 'axios';
import PriceTrends from './PriceTrends';
import Fundamentals from './Fundamentals';
import StockChart from './StockChart';

const MainContent = ({ stockData, loading, symbol }) => {
  const [historicalData, setHistoricalData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (symbol) {
        setChartLoading(true);
        try {
          const response = await axios.get(`http://localhost:8000/historical/${symbol}?period=6mo`);
          setHistoricalData(response.data);
        } catch (error) {
          console.error('Error fetching historical data:', error);
        }
        setChartLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol]);

  if (loading || chartLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ marginLeft: '240px', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Indian Stock Financial Advisor Tool
      </Typography>

      {stockData && (
        <>
          <Typography variant="h5" gutterBottom>
            Latest Price for {symbol}: ₹{stockData.latest_price}
          </Typography>

          {/* Stock Chart */}
          {historicalData && (
            <StockChart 
              historicalData={historicalData}
              symbol={symbol}
            />
          )}

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <PriceTrends priceTrends={stockData.price_trends} />
            </Grid>

            <Grid item xs={12}>
              <Fundamentals 
                fundamentals={stockData.fundamentals}
                recommendation={stockData.recommendation}
              />
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Detailed Advice
                </Typography>
                <Typography>
                  {stockData.detailed_advice}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default MainContent;