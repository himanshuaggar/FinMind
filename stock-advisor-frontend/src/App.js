import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF4B4B', // Streamlit's primary color
    },
    background: {
      default: '#FFFFFF',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [symbol, setSymbol] = React.useState('RELIANCE.NS');
  const [stockData, setStockData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app">
          <Sidebar 
            symbol={symbol} 
            setSymbol={setSymbol}
            setStockData={setStockData}
            setLoading={setLoading}
          />
          <MainContent 
            stockData={stockData}
            loading={loading}
            symbol={symbol}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;