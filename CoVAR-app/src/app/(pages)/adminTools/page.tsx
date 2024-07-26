'use client'
import React from 'react';
import { Box } from '@mui/material';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import UserList from './components/userList';

const AdminTools: React.FC = () => {
  return (
      <Box sx={mainContentStyles}>
        <UserList />
      </Box>
  );
};

export default AdminTools;
