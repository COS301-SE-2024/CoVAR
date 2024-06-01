import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../sidebar/sidebar';
import { mainContentStyles } from '../styles/sidebarStyle';
import { adminToolsContainerStyles } from '../styles/adminToolsStyle';

const AdminTools: React.FC = () => {
  return (
    <Box sx={adminToolsContainerStyles}>
      <Sidebar />
      <Box sx={mainContentStyles}>
        {/* Main content goes here */}
      </Box>
    </Box>
  );
};

export default AdminTools;
