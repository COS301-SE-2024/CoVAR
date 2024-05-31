import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../sidebar/sidebar';
import { mainContentStyles } from '../styles/sidebarStyle';
import { evaluateContainerStyles } from '../styles/evaluateStyle';

const Evaluate: React.FC = () => {
  return (
    <Box sx={evaluateContainerStyles}>
      <Sidebar />
      <Box sx={mainContentStyles}>
        {/* Main content goes here */}
      </Box>
    </Box>
  );
};

export default Evaluate;
