'use client'
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import UserList from './components/userList';
import { Loader } from '@/styles/conflictStyle';
import { boxStyles } from '@/styles/evaluateStyle';

const AdminTools: React.FC = () => {
  
  const [loading, setLoading] = useState(true); 

 
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer); 
  }, []);


  if (loading) {
    return (
      <Box
        sx={{
          ...boxStyles,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <Loader />
      </Box>
    );
  }

  return (
    <Box sx={mainContentStyles}>
      <UserList />
    </Box>
  );
};

export default AdminTools;
