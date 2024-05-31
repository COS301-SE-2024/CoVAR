import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../sidebar/sidebar';
import { mainContentStyles } from '../styles/sidebarStyle';
import { accountContainerStyles } from '../styles/accountStyle';

const Account: React.FC = () => {
  return (
    <Box sx={accountContainerStyles}>
      <Sidebar />
      <Box sx={mainContentStyles}>
        {/* Main content goes here */}
      </Box>
    </Box>
  );
};

export default Account;
