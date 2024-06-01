import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemText, ListItemIcon, Typography, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LockIcon from '@mui/icons-material/Lock'; // Added LockIcon import
import { 
  sidebarStyles, 
  sidebarItemStyles, 
  iconStyles, 
  logoStyles, 
  logoutButtonStyles 
} from '../styles/sidebarStyle';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <Box sx={sidebarStyles}>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', ...logoStyles }}>
        <LockIcon sx={{ fontSize: 'inherit', marginRight: 1, color: '#52796F' }} /> CoVAR {/* Lock icon added here */}
      </Typography>
      <List>
        <ListItem button component={Link} to="/" sx={{ ...sidebarItemStyles, backgroundColor: location.pathname === '/' ? '#52796F !important' : 'inherit' }}>
          <ListItemIcon>
            <DashboardIcon sx={iconStyles} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/evaluate" sx={{ ...sidebarItemStyles, backgroundColor: location.pathname === '/evaluate' ? '#52796F !important' : 'inherit' }}>
          <ListItemIcon>
            <AssessmentIcon sx={iconStyles} />
          </ListItemIcon>
          <ListItemText primary="Evaluate" />
        </ListItem>
        <ListItem button component={Link} to="/account" sx={{ ...sidebarItemStyles, backgroundColor: location.pathname === '/account' ? '#52796F !important' : 'inherit' }}>
          <ListItemIcon>
            <AccountCircleIcon sx={iconStyles} />
          </ListItemIcon>
          <ListItemText primary="Account" />
        </ListItem>
        <ListItem button component={Link} to="/settings" sx={{ ...sidebarItemStyles, backgroundColor: location.pathname === '/settings' ? '#52796F !important' : 'inherit' }}>
          <ListItemIcon>
            <SettingsIcon sx={iconStyles} />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button component={Link} to="/admin-tools" sx={{ ...sidebarItemStyles, backgroundColor: location.pathname === '/admin-tools' ? '#52796F !important' : 'inherit' }}>
          <ListItemIcon>
            <AdminPanelSettingsIcon sx={iconStyles} />
          </ListItemIcon>
          <ListItemText primary="Admin Tools" />
        </ListItem>
      </List>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<ExitToAppIcon />} 
        component={Link} 
        to="/login" 
        sx={logoutButtonStyles}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Sidebar;
