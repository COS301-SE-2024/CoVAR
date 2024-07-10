import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const reports = [
  { name: 'Report 1', date: '2023-01-01', severity: 'Critical', status: 'Open', description: 'Description 1' },
  { name: 'Report 2', date: '2023-02-01', severity: 'High', status: 'Closed', description: 'Description 2' },
  { name: 'Report 3', date: '2023-03-01', severity: 'Medium', status: 'Open', description: 'Description 3' },
];

const ReportsList: React.FC = () => {
  return (
    <Paper>
      <Box p={2} textAlign="center">
        <Typography variant="h6">Reports List</Typography>
        <List>
          {reports.map((report, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={report.name}
                secondary={`${report.date} - Severity: ${report.severity} - Status: ${report.status}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default ReportsList;
