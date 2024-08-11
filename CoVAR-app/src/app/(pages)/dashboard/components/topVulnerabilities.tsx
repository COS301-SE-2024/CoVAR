'use client'
import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { VulnerabilityReport } from '../page';
import { ResponsiveContainer } from 'recharts';

interface TopVulnerabilitiesProps {
    vulnerabilities: VulnerabilityReport[];
}

const TopVulnerabilities: React.FC<TopVulnerabilitiesProps> = ({ vulnerabilities }) => {
    return (
        <ResponsiveContainer width="100%" height={400}>
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
        </ResponsiveContainer>

    );
};

export default TopVulnerabilities;
