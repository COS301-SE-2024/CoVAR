'use client'
import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button } from '@mui/material';
import { populateReportsTable, fetchExecReport } from '@/functions/requests';

type Report = {
    report_id: string;
    created_at: string;
    criticalCount: number;
    mediumCount: number;
    lowCount: number;
};

const ReportsPage = () => {
    const [reports, setReports] = useState<Report[]>([]); // State to store reports data
    const [loading, setLoading] = useState<boolean>(true); // State to handle loading

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await populateReportsTable();
                console.log('API Response.data:', response.reports); // Add this line to log the API response
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const handleFetchExecReport = async (reportId: string) => {
      try {
          const blob = await fetchExecReport(reportId); // Fetch the PDF blob
  
          // Create a URL for the blob
          const url = window.URL.createObjectURL(new Blob([blob]));
  
          // Create a link element
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `executive_report_${reportId}.pdf`); // Set the file name
  
          // Append the link to the document body
          document.body.appendChild(link);
  
          // Programmatically click the link to trigger the download
          link.click();
  
          // Clean up by removing the link and revoking the object URL
          link.parentNode?.removeChild(link);
          window.URL.revokeObjectURL(url);
  
      } catch (error) {
          console.error('Error fetching executive report:', error);
      }
  };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" sx={{ marginBottom: 2 }}>
                Reports
            </Typography>
            <TableContainer component={Paper} sx={{ border: '1px solid #ccc' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#52796F' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#CAD2C5', fontWeight: 'bold' }}>Report ID</TableCell>
                            <TableCell sx={{ color: '#CAD2C5', fontWeight: 'bold' }}>Date Created</TableCell>
                            <TableCell sx={{ color: '#CAD2C5', fontWeight: 'bold' }}>Critical Count</TableCell>
                            <TableCell sx={{ color: '#CAD2C5', fontWeight: 'bold' }}>Medium Count</TableCell>
                            <TableCell sx={{ color: '#CAD2C5', fontWeight: 'bold' }}>Low Count</TableCell>
                            <TableCell sx={{ color: '#CAD2C5', fontWeight: 'bold' }}>Actions</TableCell> {/* New column for actions */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.report_id}>
                                <TableCell>{report.report_id}</TableCell>
                                <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                                <TableCell>{report.criticalCount}</TableCell>
                                <TableCell>{report.mediumCount}</TableCell>
                                <TableCell>{report.lowCount}</TableCell>
                                <TableCell>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={() => handleFetchExecReport(report.report_id)}
                                    >
                                        Download Executive Report
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
