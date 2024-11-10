import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { BarChart, MonetizationOn, Assessment } from '@mui/icons-material';
import SideNav from '../../components/SideNav';

const Advisor = () => {
  const [financialData, setFinancialData] = useState({
    income: 0,
    expenses: {
      Housing: 0,
      Food: 0,
      Transportation: 0,
      Utilities: 0,
      Entertainment: 0,
      Other: 0
    },
    savings: 0,
    investments: {
      Stocks: 0,
      'Mutual Funds': 0,
      'Fixed Deposits': 0,
      'Real Estate': 0,
      Others: 0
    },
    debts: {
      'Home Loan': 0,
      'Car Loan': 0,
      'Personal Loan': 0,
      'Credit Card': 0,
      'Other Debts': 0
    },
    goals: []
  });

  const [chatHistory, setChatHistory] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const handleInputChange = (category, subcategory, value) => {
    setFinancialData(prev => ({
      ...prev,
      [category]: subcategory 
        ? { ...prev[category], [subcategory]: parseFloat(value) || 0 }
        : parseFloat(value) || 0
    }));
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setFinancialData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('http://localhost:8000/chat/advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          financial_data: financialData
        })
      });

      const data = await response.json();
      
      setChatHistory(prev => [...prev, 
        { role: 'user', content: newMessage },
        { role: 'assistant', content: data.advice }
      ]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Financial Overview */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <MonetizationOn /> Financial Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Monthly Income"
                      type="number"
                      value={financialData.income}
                      onChange={(e) => handleInputChange('income', null, e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Monthly Savings"
                      type="number"
                      value={financialData.savings}
                      onChange={(e) => handleInputChange('savings', null, e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Expenses Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <Assessment /> Monthly Expenses
                </Typography>
                {Object.entries(financialData.expenses).map(([category, value]) => (
                  <TextField
                    key={category}
                    fullWidth
                    label={category}
                    type="number"
                    value={value}
                    onChange={(e) => handleInputChange('expenses', category, e.target.value)}
                    sx={{ mb: 2 }}
                  />
                ))}
              </Paper>
            </Grid>

            {/* Investments Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <BarChart /> Investments
                </Typography>
                {Object.entries(financialData.investments).map(([category, value]) => (
                  <TextField
                    key={category}
                    fullWidth
                    label={category}
                    type="number"
                    value={value}
                    onChange={(e) => handleInputChange('investments', category, e.target.value)}
                    sx={{ mb: 2 }}
                  />
                ))}
              </Paper>
            </Grid>

            {/* Goals Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Financial Goals
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add a new goal"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                  />
                  <Button variant="contained" onClick={handleAddGoal}>
                    Add Goal
                  </Button>
                </Box>
                <List>
                  {financialData.goals.map((goal, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`${index + 1}. ${goal}`} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Chat Interface */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Financial Advisor Chat
                </Typography>
                <Box sx={{ height: '300px', overflowY: 'auto', mb: 2 }}>
                  {chatHistory.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1,
                        bgcolor: message.role === 'user' ? 'grey.100' : 'primary.light',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <Typography>{message.content}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Ask for financial advice"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button variant="contained" onClick={handleSendMessage}>
                    Send
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Advisor;