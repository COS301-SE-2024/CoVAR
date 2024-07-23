'use client'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GroupsIcon from '@mui/icons-material/Groups';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Button, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import { ThemeContext } from '../styles/customThemeProvider';
import { iconStyles, logoStyles, logoutButtonStyles, sidebarItemStyles, sidebarStyles } from '../styles/sidebarStyle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUserRole } from '@/functions/requests';
import { doSignOut } from '../functions/firebase/auth';


const Sidebar: React.FC = () => {
  const router = useRouter();
  const location = usePathname();
  const theme = useTheme();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const redirectToLogin = () => {
    router.replace('/login');
  };

  const fetchUserRole = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const data = await getUserRole(accessToken);
        setRole(data.role);
      }
    } catch (error:any) {
      console.error("Error fetching user role:", error);
      if (error.response?.status === 403) {
        redirectToLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [location]);

  if (location === '/login' || location === '/') {
    return null;
  }

  const signOut = async () => {
    try {
      await doSignOut();
      router.replace('/login');
    } catch (error) {
      console.error('signout error', error);
    }
  };

  const ThemeToggleButton: React.FC = () => {
    const { toggleTheme } = useContext(ThemeContext);
    return (
      <Button onClick={toggleTheme} color="inherit">
        Toggle Theme
      </Button>
    );
  };

  const isActive = (path: string) => location === path;

  return (
    <Box sx={sidebarStyles}>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', ...logoStyles }}>
        <LockIcon sx={{ fontSize: 'inherit', marginRight: 1, color: theme.palette.primary.main }} /> CoVAR
      </Typography>
      <List>
        <Link href='/dashboard'>
          <ListItem
            sx={{
              ...sidebarItemStyles,
              backgroundColor: isActive('/dashboard') ? theme.palette.primary.main : 'inherit',
              color: isActive('/dashboard') ? 'white' : theme.palette.text.primary,
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          >
            <ListItemIcon sx={{ ...iconStyles, color: isActive('/') ? 'white' : theme.palette.text.primary }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
        </Link>
        {(role === "va" || role === "admin") && (
          <Link href='/evaluate'>
            <ListItem
              sx={{
                ...sidebarItemStyles,
                backgroundColor: isActive('/evaluate') ? theme.palette.primary.main : 'inherit',
                color: isActive('/evaluate') ? 'white' : theme.palette.text.primary,
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                },
              }}
            >
              <ListItemIcon sx={{ ...iconStyles, color: isActive('/evaluate') ? 'white' : theme.palette.text.primary }}>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText primary="Evaluate" />
            </ListItem>
          </Link>
        )}
        <Link href='/account'>
          <ListItem
            sx={{
              ...sidebarItemStyles,
              backgroundColor: isActive('/account') ? theme.palette.primary.main : 'inherit',
              color: isActive('/account') ? 'white' : theme.palette.text.primary,
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          >
            <ListItemIcon sx={{ ...iconStyles, color: isActive('/account') ? 'white' : theme.palette.text.primary }}>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Account" />
          </ListItem>
        </Link>
        <Link href='/organisation'>
          <ListItem
            sx={{
              ...sidebarItemStyles,
              backgroundColor: isActive('/organisation') ? theme.palette.primary.main : 'inherit',
              color: isActive('/organisation') ? 'white' : theme.palette.text.primary,
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          >
            <ListItemIcon sx={{ ...iconStyles, color: isActive('/organisation') ? 'white' : theme.palette.text.primary }}>
              <GroupsIcon />
            </ListItemIcon>
            <ListItemText primary="Organisation" />
          </ListItem>
        </Link>
        <Link href='/settings'>
          <ListItem
            sx={{
              ...sidebarItemStyles,
              backgroundColor: isActive('/settings') ? theme.palette.primary.main : 'inherit',
              color: isActive('/settings') ? 'white' : theme.palette.text.primary,
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          >
            <ListItemIcon sx={{ ...iconStyles, color: isActive('/settings') ? 'white' : theme.palette.text.primary }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </Link>
        {role === "admin" && (
          <Link href='/adminTools'>
            <ListItem
              sx={{
                ...sidebarItemStyles,
                backgroundColor: isActive('/adminTools') ? theme.palette.primary.main : 'inherit',
                color: isActive('/adminTools') ? 'white' : theme.palette.text.primary,
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                },
              }}
            >
              <ListItemIcon sx={{ ...iconStyles, color: isActive('/admin-tools') ? 'white' : theme.palette.text.primary }}>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Admin Tools" />
            </ListItem>
          </Link>
        )}

        <Link href='/help'>
          <ListItem
              sx={{
                  ...sidebarItemStyles,
                  backgroundColor: isActive('/help') ? theme.palette.primary.main : 'inherit',
                  color: isActive('/help') ? 'white' : theme.palette.text.primary,
                  borderRadius: '10px',
                  '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                  },
              }}
              >
              <ListItemIcon sx={{ ...iconStyles, color: isActive('/help') ? 'white' : theme.palette.text.primary }}>
                  <HelpOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Help" />
          </ListItem>
        </Link>
      </List>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ExitToAppIcon />}
        href="/login"
        sx={logoutButtonStyles}
        onClick={signOut}
      >
        Logout
      </Button>

      <ThemeToggleButton />
    </Box>
  );
};

export default Sidebar;
