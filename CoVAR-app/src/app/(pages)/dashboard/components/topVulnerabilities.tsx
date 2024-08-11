'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { VulnerabilityReport } from '../page';
import { ResponsiveContainer } from 'recharts';
import { TOPG } from '@/functions/requests';

interface TopVulnerabilitiesProps {
    vulnerabilities: VulnerabilityReport[];
}

const TopVulnerabilities: React.FC<TopVulnerabilitiesProps> = ({ vulnerabilities }) => {
    const [theG, setTheG] = useState<{ result: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <List>
                {vulnerabilities.map((vulnerability, index) => (
                    <ListItem key={index}>
                        <ListItemText
                            primary={
                                loading
                                    ? index === 0 && <CircularProgress size={20} />
                                    : `${vulnerability.nvtName} (${vulnerability.Severity})`
                            }
                            secondary={`IP: ${vulnerability.IP}, Port: ${vulnerability.Port}, CVSS: ${vulnerability.CVSS}`}
                        />
                        {index === 0 && theG && !loading && (
                            <Box mt={2}>
                                <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                                    View Insight
                                </Button>
                                <Dialog open={open} onClose={handleClose}>
                                    <DialogTitle>Insight</DialogTitle>
                                    <DialogContent>
                                        <Typography variant="body2">
                                            {theG.result}
                                        </Typography>
                                    </DialogContent>
                                </Dialog>
                            </Box>
                        )}
                    </ListItem>
                ))}
            </List>
        </ResponsiveContainer>
    );
};

export default TopVulnerabilities;
