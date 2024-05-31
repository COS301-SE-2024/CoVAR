import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../sidebar/sidebar';
import { mainContentStyles } from '../styles/sidebarStyle';
import { dashboardContainerStyles } from '../styles/dashboardStyle';

const Dashboard: React.FC = () => {
  return (
    <Box sx={dashboardContainerStyles}>
      <Sidebar />
      <Box sx={mainContentStyles}>
        {/* Main content goes here */}
      </Box>
    </Box>
  );
};

export default Dashboard;
