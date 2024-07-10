import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const TopVulnerabilities: React.FC = () => {
  return (
    <Paper>
      <Box p={2} textAlign="center">
        <Typography variant="h6">Top Vulnerabilities</Typography>
        <List>
          <ListItem>
            <ListItemText primary="Critical Vulnerability 1" secondary="Description of the vulnerability." />
          </ListItem>
          <ListItem>
            <ListItemText primary="High Vulnerability 1" secondary="Description of the vulnerability." />
          </ListItem>
          {/* Add more list items as needed */}
        </List>
      </Box>
    </Paper>
  );
};

export default TopVulnerabilities;
