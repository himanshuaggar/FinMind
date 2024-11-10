import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
} from '@mui/material';

const Fundamentals = ({ fundamentals, recommendation }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Fundamental Analysis
      </Typography>
      
      <Grid container spacing={2}>
        {Object.entries(fundamentals).map(([key, value]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                {key}
              </Typography>
              <Typography variant="body1">
                {value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Stock Recommendation
        </Typography>
        <Typography variant="body1" color="primary">
          {recommendation}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Fundamentals;