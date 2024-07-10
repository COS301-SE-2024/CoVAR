import React from 'react';
import { Box, Typography, Paper, Select, MenuItem, TextField, Button } from '@mui/material';

const Filters: React.FC = () => {
  return (
    <Paper>
      <Box p={2} textAlign='center'>
        <Typography variant="h6">Filters</Typography>
        <Select fullWidth defaultValue="">
          <MenuItem value="">All Severities</MenuItem>
          <MenuItem value="Critical">Critical</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </Select>
        <TextField fullWidth margin="normal" type="date" label="From Date" InputLabelProps={{ shrink: true }} />
        <TextField fullWidth margin="normal" type="date" label="To Date" InputLabelProps={{ shrink: true }} />
        <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
};

export default Filters;
