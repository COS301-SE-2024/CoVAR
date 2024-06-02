import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../sidebar/sidebar'; // adjust the path as necessary
import { layoutStyle } from '../styles/layoutStyle'; // adjust the path as necessary

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <Box sx={ layoutStyle }>
      <Sidebar />
      {children}
    </Box>
  );
};

export default Layout;