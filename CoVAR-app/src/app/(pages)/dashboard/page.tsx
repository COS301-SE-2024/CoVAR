'use client'
import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import { chartContainerStyles } from '../../../styles/dashboardStyle';
import SeverityDistribution from './components/severityDistribution';
import VulnerabilityLineChart from './components/lineChart';
import ReportsList from './components/reportsList';
import TopVulnerabilities from './components/topVulnerabilities';
import { getAllReports } from '@/functions/requests';

interface VulnerabilityReport {
    IP: string;
    Hostname: string;
    Port: string;
    portProtocol: string;
    CVSS: string;
    Severity: string;
    solutionType: string;
    nvtName: string;
    Summary: string;
    specificResult: string;
    nvtOid: string;
    CVEs: string;
    taskId: string;
    taskName: string;
    Timestamp: string;
    resultId: string;
    Impact: string;
    Solution: string;
    affectedSoftwareOs: string;
    vulnerabilityInsight: string;
    vulnerabilityDetectionMethod: string;
    productDetectionResult: string;
    BIDs: string;
    CERTs: string;
    otherReferences: string;
}

const Dashboard: React.FC = () => {
    const [severityDistribution, setSeverityDistribution] = useState<{ name: string; value: number }[]>([]);
    const [topVulnerabilities, setTopVulnerabilities] = useState<VulnerabilityReport[]>([]);
    const [allReports, setAllReports] = useState<VulnerabilityReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<VulnerabilityReport[]>([]);
    const [selectedSeverity, setSelectedSeverity] = useState<string>('');
    const [responseData, setResponseData] = useState<any[]>([]);
    const initialMount = useRef(true);

    const fetchReports = async () => {
        try {
            const responseData = await getAllReports();
            console.log(responseData);
            setResponseData(responseData);

            const reports = responseData[0].content.reports.flat();
            calculateSeverityDistribution(reports);
            setTopVulnerabilities(reports.sort((a: VulnerabilityReport, b: VulnerabilityReport) => parseFloat(b.CVSS) - parseFloat(a.CVSS)).slice(0, 5));
            setAllReports(reports);
            setFilteredReports(reports);
        } catch (error) {
            console.log(error);
        }
    };

    const calculateSeverityDistribution = (reports: VulnerabilityReport[]) => {
        const distribution: { [key: string]: number } = {
            Critical: 0,
            High: 0,
            Medium: 0,
            Low: 0
        };

        reports.forEach(vulnerability => {
            const severity = vulnerability.Severity;
            if (severity === 'Critical' || severity === 'High' || severity === 'Medium' || severity === 'Low') {
                distribution[severity]++;
            }
        });

        const pieData = Object.keys(distribution).map(key => ({
            name: key,
            value: distribution[key]
        }));

        setSeverityDistribution(pieData);
    };

    const handleSeverityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedSeverity(event.target.value);
        applyFilters(event.target.value);
    };

    const applyFilters = (severity: string) => {
        let filtered = allReports;

        if (severity) {
            filtered = filtered.filter(vulnerability => vulnerability.Severity === severity);
        }

        setFilteredReports(filtered);
    };

    useEffect(() => {
        if (initialMount.current) {
            fetchReports();
            initialMount.current = false;
        }
    }, []);

    // return (
    //     <Box sx={mainContentStyles}>
    //         {allReports.length === 0 ? (
    //                 <Paper sx={chartContainerStyles}>
    //                      <Typography variant="h6">No available reports</Typography>
    //                 </Paper>
    //         ) : (
    //             <Grid container spacing={2}>
    //                 <Grid item xs={12} md={6}>
    //                     <Paper sx={chartContainerStyles}>
    //                         <Typography variant="h6">Severity Distribution</Typography>
    //                         <SeverityDistribution data={severityDistribution} />
    //                     </Paper>
    //                 </Grid>
    //                 <Grid item xs={12} md={6}>
    //                     <Paper sx={chartContainerStyles}>
    //                         <Typography variant="h6">Vulnerabilities Over Time</Typography>
    //                         <VulnerabilityLineChart responseData={responseData} />
    //                     </Paper>
    //                 </Grid>
    //                 <Grid item xs={12}>
    //                     <ReportsList
    //                         reports={filteredReports}
    //                         selectedSeverity={selectedSeverity}
    //                         handleSeverityChange={handleSeverityChange}
    //                     />
    //                 </Grid>
    //                 <Grid item xs={12} md={6}>
    //                     <TopVulnerabilities vulnerabilities={topVulnerabilities} />
    //                 </Grid>
    //             </Grid>
    //         )}
    //     </Box>
    // );

    return (
        <Box sx={mainContentStyles}>
            {allReports.length === 0 ? (
                <Paper sx={chartContainerStyles}>
                    <Typography variant="h6">No available reports</Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={chartContainerStyles}>
                            <Typography variant="h6">Severity Distribution</Typography>
                            <SeverityDistribution data={severityDistribution} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper sx={chartContainerStyles}>
                            <Typography variant="h6">Vulnerabilities Over Time</Typography>
                            <VulnerabilityLineChart responseData={responseData} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                            <TopVulnerabilities vulnerabilities={topVulnerabilities} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                            <ReportsList
                                reports={filteredReports}
                                selectedSeverity={selectedSeverity}
                                handleSeverityChange={handleSeverityChange}
                            />
                    </Grid>
                </Grid>
            )}
        </Box>
    );

};

export default Dashboard;
export type { VulnerabilityReport };
