import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, List, ListItem, ListItemText, ListItemIcon, Typography, Button, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LockIcon from '@mui/icons-material/Lock';
import GroupsIcon from '@mui/icons-material/Groups'; 
import { getUserRole } from '../requests/requests';

import { sidebarStyles, sidebarItemStyles, iconStyles, logoStyles, logoutButtonStyles } from '../styles/sidebarStyle';
import { doSignOut } from '../firebase/auth';
import { ThemeContext } from '../styles/customThemeProvider';

const Sidebar: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const data = await getUserRole(accessToken);
          setRole(data.role);
          console.log("Role:", data.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  const signOut = async () => {
    try {
      await doSignOut();
      navigate('/login');
    } catch (error) {
      console.error(error);
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={sidebarStyles}>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', ...logoStyles }}>
        <LockIcon sx={{ fontSize: 'inherit', marginRight: 1, color: theme.palette.primary.main }} /> CoVAR
      </Typography>
      <List>
        <ListItem
          component={Link}
          to="/"
          sx={{
            ...sidebarItemStyles,
            backgroundColor: isActive('/') ? theme.palette.primary.main : 'inherit',
            color: isActive('/') ? 'white' : theme.palette.text.primary,
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
        {(role === "va" || role === "admin") && (
          <ListItem
            component={Link}
            to="/evaluate"
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
        )}
        <ListItem
          component={Link}
          to="/account"
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
        <ListItem
          component={Link}
          to="/organisation"
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
        <ListItem
          component={Link}
          to="/settings"
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
        {role === "admin" && (
          <ListItem
            component={Link}
            to="/admin-tools"
            sx={{
              ...sidebarItemStyles,
              backgroundColor: isActive('/admin-tools') ? theme.palette.primary.main : 'inherit',
              color: isActive('/admin-tools') ? 'white' : theme.palette.text.primary,
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
        )}
      </List>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ExitToAppIcon />}
        component={Link}
        to="/login"
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
