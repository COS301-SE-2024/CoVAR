'use client';
import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button } from '@mui/material';
import { populateReportsTable, fetchExecReport, fetchTechReport } from '@/functions/requests'; 
import DownloadIcon from '@mui/icons-material/Download';
import { mainContentStyles } from '@/styles/evaluateStyle';
import { useTheme } from '@mui/material/styles';

type Report = {
    report_id: string;
    created_at: string;
    criticalCount: number;
    mediumCount: number;
    lowCount: number;
};

const ReportsPage = () => {
    const [reports, setReports] = useState<Report[]>([]); 
    const [loading, setLoading] = useState<boolean>(true); 
    const theme = useTheme(); 

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await populateReportsTable();
                if (response.reports) {
                    setReports(response.reports);
                }
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return (
            <Box sx={{
                ...mainContentStyles,
                position: 'absolute',
                top: '50%',
                left: '57%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '90%',
                height: '100%',
            }}>
                <CircularProgress />
            </Box>
        );
    }

    const handleFetchExecReport = async (reportId: string) => {
        try {
            const blob = await fetchExecReport(reportId); 
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `executive_report_${reportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error fetching executive report:', error);
        }
    };

    const handleFetchTechReport = async (reportId: string) => {
        try {
            const blob = await fetchTechReport(reportId); 
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `technical_report_${reportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error fetching technical report:', error);
        }
    };

    // Determine header background color based on light/dark mode
    const tableHeaderBackground = theme.palette.mode === 'light' ? '#b0b0b0' : theme.palette.background.paper;

    return (
        <Box sx={{ ...mainContentStyles, padding: 3, width: '100%' }}>
            <Typography variant="h4" sx={{ marginBottom: 2, color: 'text.primary' }}>
                Reports
            </Typography>
            <TableContainer component={Paper} sx={{ ...mainContentStyles, border: '1px solid #ccc', maxHeight: '80vh', overflowY: 'auto' }}>
                <Table stickyHeader>
                    <TableHead sx={{ backgroundColor: tableHeaderBackground }}>
                        <TableRow>
                            <TableCell sx={{ backgroundColor: tableHeaderBackground, color: 'text.primary', fontWeight: 'bold' }}>Report ID</TableCell>
                            <TableCell sx={{ backgroundColor: tableHeaderBackground, color: 'text.primary', fontWeight: 'bold' }}>Date Created</TableCell>
                            <TableCell sx={{ backgroundColor: tableHeaderBackground, color: 'error.main', fontWeight: 'bold' }}>Critical Count</TableCell>
                            <TableCell sx={{ backgroundColor: tableHeaderBackground, color: 'orange', fontWeight: 'bold' }}>Medium Count</TableCell>
                            <TableCell sx={{ backgroundColor: tableHeaderBackground, color: 'success.main', fontWeight: 'bold' }}>Low Count</TableCell>
                            <TableCell sx={{ backgroundColor: tableHeaderBackground, color: 'text.primary', fontWeight: 'bold' }}>Technical Report</TableCell>
                            <TableCell sx={{ backgroundColor: tableHeaderBackground, color: 'text.primary', fontWeight: 'bold' }}>Executive Report</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.report_id}>
                                <TableCell>{report.report_id}</TableCell>
                                <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                                <TableCell sx={{ color: report.criticalCount > 0 ? 'error.main' : 'inherit' }}>{report.criticalCount}</TableCell>
                                <TableCell sx={{ color: report.mediumCount > 0 ? 'orange' : 'inherit' }}>{report.mediumCount}</TableCell>
                                <TableCell sx={{ color: report.lowCount > 0 ? 'success.main' : 'inherit' }}>{report.lowCount}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleFetchTechReport(report.report_id)}
                                        startIcon={<DownloadIcon />} 
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            '&:hover': {
                                                backgroundColor: '#01579b',
                                            },
                                        }}
                                    >
                                        Download
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleFetchExecReport(report.report_id)}
                                        startIcon={<DownloadIcon />} 
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            '&:hover': {
                                                backgroundColor: '#01579b',
                                            },
                                        }}
                                    >
                                        Download
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ReportsPage;
