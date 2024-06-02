import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../sidebar/sidebar';
import { mainContentStyles } from '../styles/sidebarStyle';
import { adminToolsContainerStyles } from '../styles/adminToolsStyle';
import UserList from './components/userList';

const AdminTools: React.FC = () => {
  return (
    <Box sx={adminToolsContainerStyles}>
      <Sidebar />
      <Box sx={mainContentStyles}>
        <UserList />
      </Box>
    </Box>
  );
};

export default AdminTools;
