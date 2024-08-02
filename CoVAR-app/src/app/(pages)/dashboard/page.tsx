'use client'
import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import { chartContainerStyles } from '../../../styles/dashboardStyle';
import SeverityDistribution from './components/severityDistribution';
import VulnerabilitiesOverTime from './components/lineChart';
import ReportsList from './components/reportsList';
import Filters from './components/filters';
import TopVulnerabilities from './components/topVulnerabilities';
import { getAllReports } from '@/functions/requests';
import { use } from 'chai';

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
    const initialMount = useRef(true);

    const fetchReports = async () => {
        try {
            const responseData = await getAllReports();
            console.log("BALL");
            calculateSeverityDistribution(responseData[0].content.reports);
        } catch (error) {
            console.log(error);
        }
    };

    const calculateSeverityDistribution = (reports: any[]) => {
        const distribution: { [key: string]: number } = {
            Critical: 0,
            High: 0,
            Medium: 0,
            Low: 0
        };

        reports.forEach(report => {
            report.map ((vulnerability: VulnerabilityReport) => {
                const severity = vulnerability.Severity;
                if (severity === 'Critical' || severity === 'High' || severity === 'Medium' || severity === 'Low') {
                    distribution[severity]++;
                }
            });
        });

        const pieData = Object.keys(distribution).map(key => ({
            name: key,
            value: distribution[key]
        }));

        setSeverityDistribution(pieData);
    };

    if (initialMount.current) {
        fetchReports();
        initialMount.current = false;
    }

    return (
        <Box sx={mainContentStyles}>
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
                        <VulnerabilitiesOverTime />
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <ReportsList />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Filters />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TopVulnerabilities />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
