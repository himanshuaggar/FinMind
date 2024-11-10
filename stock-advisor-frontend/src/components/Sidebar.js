import React from 'react';
import {
  Drawer,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import axios from 'axios';

const Sidebar = ({ symbol, setSymbol, setStockData, setLoading }) => {
  const drawerWidth = 240;

  const handleGetAdvice = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/advice/${symbol}`);
      setStockData(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
    setLoading(false);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          padding: 2,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Enter Stock Symbol
        </Typography>
        
        <TextField
          fullWidth
          label="Stock Symbol"
          variant="outlined"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          helperText="e.g., RELIANCE.NS, TATAMOTORS.NS"
          margin="normal"
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleGetAdvice}
          sx={{ mt: 2 }}
        >
          Get Detailed Advice
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;