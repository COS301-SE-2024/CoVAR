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
import React, { useCallback, useContext, useEffect, useState } from 'react';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';

import { useThemeContext } from '../styles/customThemeProvider';
import { iconStyles, logoStyles, logoutButtonStyles, sidebarItemStyles, sidebarStyles } from '../styles/sidebarStyle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAnyUserRole } from '@/functions/requests';
import { doSignOut } from '../functions/firebase/auth';
import HelpDialog from './(pages)/help/helpDialog';
import { Switch } from '@mui/material';
import LightMode from '@mui/icons-material/LightMode';
import DarkMode from '@mui/icons-material/DarkMode';

const Sidebar: React.FC = () => {
  const router = useRouter();
  const location = usePathname();
  const theme = useTheme();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isHelpDialogOpen, setHelpDialogOpen] = useState(false);

  const handleOpenHelpDialog = () => {
    setHelpDialogOpen(true);
  };

  const handleCloseHelpDialog = () => {
    setHelpDialogOpen(false);
  };


  const redirectToLogin = useCallback(() => {
    router.replace('/login');
  }, [router]);

  const fetchUserRole = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        console.log("IM IN THE FUCKING SIDEBAR");
        const data = await getAnyUserRole(accessToken);
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
  }, [redirectToLogin]); 

  useEffect(() => {
    fetchUserRole();
  }, [location, fetchUserRole]);

  if (location === '/login' || location === '/' || location === '/lounge'){
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
    const { toggleTheme, isDarkMode } = useThemeContext(); 
    return (
      <Box sx={{ display: 'flex', alignItems: 'center',   marginTop: 'auto', mb: 3 }}>
        {isDarkMode ? (
          <DarkMode sx={{ fontSize: '1.2rem' }} /> 
        ) : (
          <LightMode sx={{ fontSize: '1.2rem' }} /> 
        )}
        <Switch
          checked={isDarkMode}
          onChange={toggleTheme}
          color="default"
          size="small" 
        />
      </Box>
    );
  };
  
  

  const isActive = (path: string) => location === path;

  return (
    <Box sx={sidebarStyles}>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', ...logoStyles }}>
        <LockIcon sx={{ fontSize: '20', marginRight: 1, color: theme.palette.primary.main }} /> CoVAR
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
        {role === "client" && (
          <Link href='/vendorGraph'>
            <ListItem
              test-id="vendorGraphLink"
              sx={{
                ...sidebarItemStyles,
                backgroundColor: isActive('/vendorGraph') ? theme.palette.primary.main : 'inherit',
                color: isActive('/vendorGraph') ? 'white' : theme.palette.text.primary,
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                },
              }}
            >
              <ListItemIcon sx={{ ...iconStyles, color: isActive('/vendorGraph') ? 'white' : theme.palette.text.primary }}>
                <BubbleChartIcon />
              </ListItemIcon>
              <ListItemText primary="Vendor Graph" />
            </ListItem>
          </Link>
        )}
        {(role === "va" || role === "admin") && (
          <Link href='/evaluate'>
            <ListItem
              test-id="evaluateLink"
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
        {/* <Link href='/account'>
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
        </Link> */}
        <Link href='/organisation'>
          <ListItem
            test-id="organisationLink"
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
        {/* <Link href='/settings'>
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
        </Link> */}
        {role === "admin" && (
          <Link href='/adminTools'>
            <ListItem
              test-id="adminToolsLink"
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

        {role === "client" && (
          <Link href='/reports'>
            <ListItem
              test-id="reportsLink"
              sx={{
                ...sidebarItemStyles,
                backgroundColor: isActive('/reports') ? theme.palette.primary.main : 'inherit',
                color: isActive('/reports') ? 'white' : theme.palette.text.primary,
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                },
              }}
            >
              <ListItemIcon sx={{ ...iconStyles, color: isActive('/reports') ? 'white' : theme.palette.text.primary }}>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText primary="Reports" />
            </ListItem>
          </Link>
        )}
      <ListItem
        onClick={handleOpenHelpDialog}
        sx={{
          ...sidebarItemStyles,
          borderRadius: '10px',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            color: theme.palette.text.primary,
          },
        }}
      >
        <ListItemIcon>
          <HelpOutlineIcon />
        </ListItemIcon>
        <ListItemText primary="Help" />
      </ListItem>
      <HelpDialog open={isHelpDialogOpen} onClose={handleCloseHelpDialog} />


      </List>

      <ThemeToggleButton />
      
      <Button
        test-id="logoutButton"
        variant="contained"
        color="primary"
        startIcon={<ExitToAppIcon />}
        href="/login"
        sx={logoutButtonStyles}
        onClick={signOut}
      >
        Logout
      </Button>


    </Box>
  );
};

export default Sidebar;
