import React from 'react';
import { List, ListItem, ListItemText, Box } from '@mui/material';
import { listContainerStyles } from '../../styles/dashboardStyle';

const ReportList: React.FC = () => {
    const reports = [
      { name: 'Report 1', date: '2023-01-01' },
      { name: 'Report 2', date: '2023-02-01' },
      { name: 'Report 3', date: '2023-03-01' },
    ];
  
    return (
        <List>
          {reports.map((report, index) => (
            <ListItem key={index}>
              <ListItemText primary={report.name} secondary={report.date} />
            </ListItem>
          ))}
        </List>
    );
  };
  
  export default ReportList;