import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const PriceTrends = ({ priceTrends }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Price Trends
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Change (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(priceTrends).map(([period, data]) => (
              <TableRow key={period}>
                <TableCell>{period}</TableCell>
                <TableCell>₹{data.end_price}</TableCell>
                <TableCell>{data.change_percentage}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PriceTrends;