'use client'
import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { VulnerabilityReport } from '../page';

interface TopVulnerabilitiesProps {
    vulnerabilities: VulnerabilityReport[];
}

const TopVulnerabilities: React.FC<TopVulnerabilitiesProps> = ({ vulnerabilities }) => {
    return (
        <Paper>
            <Box p={2} textAlign="center">
                <Typography variant="h6">Top Vulnerabilities</Typography>
                <List>
                    {vulnerabilities.map((vulnerability, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={`${vulnerability.nvtName} (${vulnerability.Severity})`}
                                secondary={`IP: ${vulnerability.IP}, Port: ${vulnerability.Port}, CVSS: ${vulnerability.CVSS}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Paper>
    );
};

export default TopVulnerabilities;
