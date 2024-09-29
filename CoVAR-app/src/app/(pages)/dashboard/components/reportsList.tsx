'use client'
import React from 'react';
import { List, ListItem, ListItemText, Typography, RadioGroup, FormControlLabel, Radio, Box } from '@mui/material';
import { VulnerabilityReport } from '../page';

interface ReportsListProps {
    reports: VulnerabilityReport[];
    selectedSeverity: string;
    handleSeverityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const severityColors: { [key: string]: { border: string; background: string } } = {
    High: { border: '#ff8c00', background: 'rgba(255, 140, 0, 0.1)' },   // Dark Orange
    Medium: { border: '#ffd700', background: 'rgba(255, 215, 0, 0.1)' }, // Gold
    Low: { border: '#32cd32', background: 'rgba(50, 205, 50, 0.1)' },    // Lime Green
};

const ReportsList: React.FC<ReportsListProps> = ({ reports, selectedSeverity, handleSeverityChange }) => {
    return (
        <Box sx={{ width: '100%', overflowX: 'hidden', padding: '10px' }}>
            {/* Filter radio buttons (stick to the top) */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    paddingBottom: '8px',
                    marginBottom: '16px',
                }}
            >
                <RadioGroup
                    row
                    value={selectedSeverity}
                    onChange={handleSeverityChange}
                    sx={{ justifyContent: 'center' }}
                >
                    {Object.keys(severityColors).map((severity) => (
                        <FormControlLabel
                            key={severity}
                            value={severity}
                            control={<Radio sx={{ color: severityColors[severity].border }} />}
                            label={<Typography sx={{ color: severityColors[severity].border }}>{severity}</Typography>}
                        />
                    ))}
                    <FormControlLabel value="" control={<Radio />} label="All" />
                </RadioGroup>
            </Box>

            {/* Vulnerabilities list */}
            <Box 
            sx={{ 
                height: '400px', 
                overflowY: 'auto', 
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                    width: '0.2vw', 
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'gray', 
                    borderRadius: '0.4vw',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent', 
                },
                scrollbarWidth: 'thin', 
                scrollbarColor: 'gray transparent', 
             }}>
                {reports.length === 0 ? (
                    <Typography variant="body1" sx={{ padding: '16px', textAlign: 'center' }}>
                        No Vulnerabilities
                    </Typography>
                ) : (
                    <List sx={{ height: '100%' }}>
                        {reports.map((report, index) => (
                            <ListItem
                                key={index}
                                sx={{
                                    border: `2px solid ${severityColors[report.Severity]?.border || 'inherit'}`,
                                    backgroundColor: severityColors[report.Severity]?.background || 'inherit',
                                    margin: '6px',
                                    borderRadius: '4px',
                                    width: '98%',
                                    maxWidth : '98%',
                                }}
                            >
                                <ListItemText
                                    primary={`${report.nvtName} (${report.Severity})`}
                                    secondary={`IP: ${report.IP}, Port: ${report.Port}, CVSS: ${report.CVSS}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
};

export default ReportsList;
