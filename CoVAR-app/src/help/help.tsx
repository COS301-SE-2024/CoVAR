import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { mainContentStyles } from '../styles/sidebarStyle';


const Help: React.FC = () => {
    const theme = useTheme(); // Use useTheme hook to access the current theme
  
    return (
      <Box sx={{ ...mainContentStyles, backgroundColor: theme.palette.background.default }}>
        <Paper sx={{ padding: theme.spacing(2) }}>
          <Typography variant="h4" gutterBottom color="text.primary">
            Help and Information
          </Typography>
          <Typography variant="h6" gutterBottom color="text.primary">
            Dashboard
          </Typography>
          <Typography variant="body1" paragraph color="text.primary">
            The Dashboard page displays various charts and lists to provide an overview of important data.
          </Typography>
          
          <Typography variant="h6" gutterBottom color="text.primary">
            Example Chart 1 and Example Chart 2
          </Typography>
          <Typography variant="body1" paragraph color="text.primary">
            These charts represent visual representations of data using Recharts library.
          </Typography>
          
          <Typography variant="h6" gutterBottom color="text.primary">
            Example List
          </Typography>
          <Typography variant="body1" paragraph color="text.primary">
            The Example List displays a list of items in a paper container.
          </Typography>
        </Paper>
      </Box>
    );
  };
  
  export default Help;
  