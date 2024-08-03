'use client'
import React from 'react';
import { List, ListItem, ListItemText, Paper } from '@mui/material';
import { VulnerabilityReport } from '../page';

interface ReportsListProps {
    reports: VulnerabilityReport[];
}

const ReportsList: React.FC<ReportsListProps> = ({ reports }) => {
    return (
        <Paper>
            <List>
                {reports.map((report, index) => (
                    <ListItem key={index}>
                        <ListItemText
                            primary={`${report.nvtName} (${report.Severity})`}
                            secondary={`IP: ${report.IP}, Port: ${report.Port}, CVSS: ${report.CVSS}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default ReportsList;
