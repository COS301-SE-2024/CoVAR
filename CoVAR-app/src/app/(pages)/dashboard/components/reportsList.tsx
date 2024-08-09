'use client'
import React from 'react';
import { List, ListItem, ListItemText, Paper, Typography, RadioGroup, FormControlLabel, Radio, Box } from '@mui/material';
import { VulnerabilityReport } from '../page';

interface ReportsListProps {
    reports: VulnerabilityReport[];
    selectedSeverity: string;
    handleSeverityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const severityColors: { [key: string]: { border: string; background: string } } = {
    Critical: { border: '#ff0000', background: 'rgba(255, 0, 0, 0.1)' },  // Red
    High: { border: '#ff8c00', background: 'rgba(255, 140, 0, 0.1)' },   // Dark Orange
    Medium: { border: '#ffd700', background: 'rgba(255, 215, 0, 0.1)' }, // Gold
    Low: { border: '#32cd32', background: 'rgba(50, 205, 50, 0.1)' },    // Lime Green
};

const ReportsList: React.FC<ReportsListProps> = ({ reports, selectedSeverity, handleSeverityChange }) => {
    return (
        <Paper sx={{ maxHeight: '400px', overflowY: 'auto', margin: '16px 0' }}>
            <Box sx={{ padding: '16px' }}>
                <Typography variant="h6" gutterBottom>
                    Filter by Severity
                </Typography>
                <RadioGroup
                    row
                    value={selectedSeverity}
                    onChange={handleSeverityChange}
                    sx={{ justifyContent: 'center' }}
                >
                    {Object.keys(severityColors).map(severity => (
                        <FormControlLabel
                            key={severity}
                            value={severity}
                            control={<Radio sx={{ color: severityColors[severity].border }} />}
                            label={<Typography sx={{ color: severityColors[severity].border }}>{severity}</Typography>}
                        />
                    ))}
                    <FormControlLabel
                        value=""
                        control={<Radio />}
                        label="All"
                    />
                </RadioGroup>
            </Box>
            {reports.length === 0 ? (
                <Typography variant="body1" sx={{ padding: '16px', textAlign: 'center' }}>
                    No reports
                </Typography>
            ) : (
                <List>
                    {reports.map((report, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                border: `2px solid ${severityColors[report.Severity]?.border || 'inherit'}`,
                                backgroundColor: severityColors[report.Severity]?.background || 'inherit',
                                margin: '4px',
                                borderRadius: '4px'
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
        </Paper>
    );
};

export default ReportsList;
