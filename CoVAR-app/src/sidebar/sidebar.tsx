import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GroupsIcon from '@mui/icons-material/Groups';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Button, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ThemeContext } from '../styles/customThemeProvider';
import { iconStyles, logoStyles, logoutButtonStyles, sidebarItemStyles, sidebarStyles } from '../styles/sidebarStyle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface SidebarProps {
  role: string | null;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onSignOut }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const signOut = async () => {
    try {
      await onSignOut();
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

        <ListItem
            component={Link}
            to="/help"
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
