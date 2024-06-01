import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import Sidebar from '../sidebar/sidebar';
import { mainContentStyles } from '../styles/sidebarStyle';
import { dashboardContainerStyles, chartContainerStyles, listContainerStyles } from '../styles/dashboardStyle';
import ChartExample from './chartExample';
import ListExample from './listExample';

const Dashboard: React.FC = () => {
  return (
    <Box sx={dashboardContainerStyles}>
      <Sidebar />
      <Box sx={mainContentStyles}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={chartContainerStyles}>
              <Typography variant="h6">Example Chart 1</Typography>
              <ChartExample />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={chartContainerStyles}>
              <Typography variant="h6">Example Chart 2</Typography>
              <ChartExample />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={listContainerStyles}>
              <Typography variant="h6">Example List</Typography>
              <ListExample />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
