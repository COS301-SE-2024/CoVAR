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
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState<{ [key: string]: boolean }>({});
    
    const fetchInsightForVulnerability = async (vulnerability: VulnerabilityReport) => {
        const chainPrompt = `${vulnerability.nvtName} (Severity: ${vulnerability.Severity}, IP: ${vulnerability.IP}, Port: ${vulnerability.Port}, CVSS: ${vulnerability.CVSS})`;
        const result = await TOPG({ chain_prompt: chainPrompt });
        return result?.result || 'No insight available';
    };

    useEffect(() => {
        const fetchAllInsights = async () => {
            const newInsights: { [key: string]: string } = {};
            for (const vulnerability of vulnerabilities) {
                try {
                    const result = await fetchInsightForVulnerability(vulnerability);
                    newInsights[vulnerability.nvtOid] = result; // Use a unique ID like nvtOid for key
                } catch (error) {
                    console.error('Error fetching insight for vulnerability:', error);
                }
            }
            setInsights(newInsights);
            setLoading(false);
        };

        fetchAllInsights();
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
                {vulnerabilities.map((vulnerability, index) => (
                    <ListItem key={vulnerability.nvtOid}>
                        <ListItemText
                            primary={
                                loading
                                    ? <CircularProgress size={20} />
                                    : `${vulnerability.nvtName} (${vulnerability.Severity})`
                            }
                            secondary={`IP: ${vulnerability.IP}, Port: ${vulnerability.Port}, CVSS: ${vulnerability.CVSS}`}
                        />
                        {!loading && insights[vulnerability.nvtOid] && (
                            <Box mt={2}>
                                <Button variant="outlined" color="primary" onClick={() => handleClickOpen(vulnerability.nvtOid)}>
                                    View Insight
                                </Button>
                                <Dialog open={open[vulnerability.nvtOid]} onClose={() => handleClose(vulnerability.nvtOid)}>
                                    <DialogTitle>Insight for {vulnerability.nvtName}</DialogTitle>
                                    <DialogContent>
                                        <Typography
                                            variant="body2"
                                            component="div"
                                            dangerouslySetInnerHTML={{ __html: marked(insights[vulnerability.nvtOid]) }}
                                        />
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
