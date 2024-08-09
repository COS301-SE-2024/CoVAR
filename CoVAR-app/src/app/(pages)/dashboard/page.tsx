'use client'
import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import { chartContainerStyles } from '../../../styles/dashboardStyle';
import SeverityDistribution from './components/severityDistribution';
import VulnerabilitiesOverTime from './components/lineChart';
import ReportsList from './components/reportsList';
import Filters from './components/filters';
import TopVulnerabilities from './components/topVulnerabilities';

const Dashboard: React.FC = () => {
  return (
    <Box sx={mainContentStyles}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
            <Paper sx = {chartContainerStyles}>
                <Typography variant="h6">Severity Distribution</Typography>
                <SeverityDistribution />
            </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={chartContainerStyles}>
            <Typography variant="h6">Vulnerabilities Over Time</Typography>
            <VulnerabilitiesOverTime />
          </Paper>
        </Grid>
        <Grid item xs={12}>
            <ReportsList />
        </Grid>
        <Grid item xs={12} md={6}>
            <Filters />
        </Grid>
        <Grid item xs={12} md={6}>
            <TopVulnerabilities />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
