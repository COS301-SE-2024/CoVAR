'use client'
import React from 'react';
import { Box } from '@mui/material';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import UserList from './components/userList';
import AuthoriseUser from './components/authoriseUser';

const AdminTools: React.FC = () => {
  return (
      <Box sx={mainContentStyles}>
        <UserList />
        <br></br>
        <br></br>
        <AuthoriseUser/>
      </Box>
  );
};

export default AdminTools;
