'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { VulnerabilityReport } from '../page';
import { ResponsiveContainer } from 'recharts';
import { TOPG } from '@/functions/requests';
import { marked } from 'marked';

interface TopVulnerabilitiesProps {
    vulnerabilities: VulnerabilityReport[];
}

const TopVulnerabilities: React.FC<TopVulnerabilitiesProps> = ({ vulnerabilities }) => {
    const [insights, setInsights] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [open, setOpen] = useState<{ [key: string]: boolean }>({});

    const fetchInsightForVulnerability = async (vulnerability: VulnerabilityReport) => {
        const chainPrompt = `${vulnerability.nvtName} (Severity: ${vulnerability.Severity}, IP: ${vulnerability.IP}, Port: ${vulnerability.Port}, CVSS: ${vulnerability.CVSS})`;
        const result = await TOPG({ chain_prompt: chainPrompt });
        return result?.result || 'No insight available';
    };

    useEffect(() => {
        vulnerabilities.forEach(vulnerability => {
            setLoading(prev => ({ ...prev, [vulnerability.nvtOid]: true }));

            fetchInsightForVulnerability(vulnerability)
                .then(result => {
                    setInsights(prev => ({ ...prev, [vulnerability.nvtOid]: result }));
                })
                .catch(error => {
                    console.error('Error fetching insight:', error);
                    setInsights(prev => ({ ...prev, [vulnerability.nvtOid]: 'Failed to load insight' }));
                })
                .finally(() => {
                    setLoading(prev => ({ ...prev, [vulnerability.nvtOid]: false }));
                });
        });
    }, [vulnerabilities]);

    const handleClickOpen = (vulnerabilityId: string) => {
        setOpen(prevState => ({ ...prevState, [vulnerabilityId]: true }));
    };

    const handleClose = (vulnerabilityId: string) => {
        setOpen(prevState => ({ ...prevState, [vulnerabilityId]: false }));
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <List>
                {vulnerabilities.map(vulnerability => (
                    <ListItem key={vulnerability.nvtOid}>
                        {/* Always show vulnerability details */}
                        <ListItemText
                            primary={`${vulnerability.nvtName} (${vulnerability.Severity})`}
                            secondary={`IP: ${vulnerability.IP}, Port: ${vulnerability.Port}, CVSS: ${vulnerability.CVSS}`}
                        />
                        {/* Show loading indicator or button depending on whether insight is available */}
                        <Box mt={2}>
                            {loading[vulnerability.nvtOid] ? (
                                <CircularProgress size={20} />
                            ) : (
                                <Button variant="outlined" color="primary" onClick={() => handleClickOpen(vulnerability.nvtOid)}>
                                    View Insight
                                </Button>
                            )}
                            <Dialog open={open[vulnerability.nvtOid]} onClose={() => handleClose(vulnerability.nvtOid)}>
                                <DialogTitle>Insight for {vulnerability.nvtName}</DialogTitle>
                                <DialogContent>
                                    <Typography
                                        variant="body2"
                                        component="div"
                                        dangerouslySetInnerHTML={{ __html: marked(insights[vulnerability.nvtOid] || '') }}
                                    />
                                </DialogContent>
                            </Dialog>
                        </Box>
                    </ListItem>
                ))}
            </List>
        </ResponsiveContainer>
    );
};

export default TopVulnerabilities;
