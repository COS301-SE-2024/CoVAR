import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../sidebar/sidebar';
import { mainContentStyles } from '../styles/sidebarStyle';
import { settingsContainerStyles } from '../styles/settingsStyle';

const Settings: React.FC = () => {
  return (
    <Box sx={settingsContainerStyles}>
      <Sidebar />
      <Box sx={mainContentStyles}>
        {/* Main content goes here */}
      </Box>
    </Box>
  );
};

export default Settings;
