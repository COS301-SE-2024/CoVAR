'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { VulnerabilityReport } from '../page';
import { TOPG } from '@/functions/requests';

interface TopVulnerabilitiesProps {
    vulnerabilities: VulnerabilityReport[];
}

const TopVulnerabilities: React.FC<TopVulnerabilitiesProps> = ({ vulnerabilities }) => {
    const [theG, setTheG] = useState<{ result: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Format vulnerabilities into a single string for the chain_prompt
                const chainPrompt = vulnerabilities
                    .map(vulnerability => 
                        `${vulnerability.nvtName} (Severity: ${vulnerability.Severity}, IP: ${vulnerability.IP}, Port: ${vulnerability.Port}, CVSS: ${vulnerability.CVSS})`
                    )
                    .join('; ');

                // Send the formatted vulnerabilities as the chain_prompt
                const result = await TOPG({ chain_prompt: chainPrompt });
                console.log('TOPG:', result);
                setTheG(result);
            } catch (error) {
                console.error('Error fetching TOPG:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [vulnerabilities]); // Include vulnerabilities as a dependency

    return (
        <Paper>
            <Box p={2} textAlign="center">
                <Typography variant="h6">Top Vulnerabilities</Typography>
                <List>
                    {vulnerabilities.map((vulnerability, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={
                                    loading
                                        ? index === 0 && <CircularProgress size={20} />
                                        : `${vulnerability.nvtName} (${vulnerability.Severity})${index === 0 && theG ? ` - ${theG.result}` : ''}`
                                }
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
