import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Sidebar from '../sidebar/sidebar'; // adjust the path as necessary
import { layoutStyle } from '../styles/layoutStyle'; // adjust the path as necessary
import { getUserRole } from '../requests/requests'; // adjust the path as necessary
import { doSignOut } from '../firebase/auth'; // adjust the path as necessary

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const data = await getUserRole(accessToken);
          setRole(data.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={layoutStyle}>
      <Sidebar role={role} onSignOut={doSignOut} />
      {children}
    </Box>
  );
};

export default Layout;
