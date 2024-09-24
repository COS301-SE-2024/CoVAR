'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid, Paper, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import { chartContainerStyles } from '../../../styles/dashboardStyle';
import SeverityDistribution from './components/severityDistribution';
import VulnerabilityLineChart from './components/lineChart';
import ReportsList from './components/reportsList';
import TopVulnerabilities from './components/topVulnerabilities';
import { getAllReports, getUserRole, fetchAssignedClients } from '@/functions/requests';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { evaluateLaunchStyles } from '../../../styles/evaluateStyle';
import { fetchReportsPerClient } from '@/functions/requests';
import ReportsPerClient from './components/reportsPerClient';


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

interface User {
    user_id: number;
    username: string;
    organization: string | null;
}

interface Organization {
    organization_id: number;
    name: string;
    owner: string;
}

interface ClientReport {
    client_name: string;
    report_count: number;
}


const Dashboard: React.FC = () => {
    const [severityDistribution, setSeverityDistribution] = useState<{ name: string; value: number }[]>([]);
    const [topVulnerabilities, setTopVulnerabilities] = useState<VulnerabilityReport[]>([]);
    const [allReports, setAllReports] = useState<VulnerabilityReport[]>([]);
    const [filteredReports, setFilteredReports] = useState<VulnerabilityReport[]>([]);
    const [selectedSeverity, setSelectedSeverity] = useState<string>('');
    const [responseData, setResponseData] = useState<any[]>([]);
    const [role, setRole] = useState<string | null>(null);
    const [userID, setUserID] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportsPerClient, setReportsPerClient] = useState<any[]>([]);


    const router = useRouter();
    const location = usePathname();

    const fetchUserRole = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                const data = await getUserRole(accessToken);
                setRole(data.role);
                setUserID(data.user_id);
            }
        } catch (error: any) {
            console.error("Error fetching user role:", error);
        }
    };

    const fetchReports = async () => {
        try {
            const responseData = await getAllReports();
            setResponseData(responseData);

            const reports = responseData[0].content.finalReport;
            calculateSeverityDistribution(reports);
            setTopVulnerabilities(reports.sort((a: VulnerabilityReport, b: VulnerabilityReport) => parseFloat(b.CVSS) - parseFloat(a.CVSS)).slice(0, 5));
            setAllReports(reports);
            setFilteredReports(reports);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchAssignedUsers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get('/api/users/assigned_clients', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching assigned users:', err);
            setLoading(false);
        }
    };

    const fetchAssignedOrganizations = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get('/api/users/assigned_organizations', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOrganizations(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching assigned organizations:', err);
            setLoading(false);
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

    const handleUserButtonClick = (user: User) => {
        router.push(`/evaluate/user/${user.username}`);
    };

    const handleOrganizationButtonClick = (organization: Organization) => {
        router.push(`/evaluate/organization/${organization.name}`);
    };

    const getReportsPerClient = async () => {
        try {
            const data: ClientReport[] = await fetchReportsPerClient();
            console.log('Reports Per Client:', data);  // Check the structure here
            const formattedData = data.map((client: ClientReport) => ({
                client_name: client.client_name,
                report_count: client.report_count
            }));
            setReportsPerClient(formattedData);
        } catch (error) {
            console.error('Error fetching reports per client:', error);
        }
    };
    

    // Fetch role on initial mount
    useEffect(() => {
        fetchUserRole();
    }, []);

    // Role-based action
    useEffect(() => {
        if (role === 'client') {
            fetchReports();
        }

        if (role === 'va') {
            fetchAssignedUsers();
            fetchAssignedOrganizations();

            // Fetch reports per client
            getReportsPerClient();
        }
    }, [role]);

    if (role === null) {
        return (
            <Box sx={mainContentStyles}>
                <Typography variant="h6">Loading...</Typography>
            </Box>
        );
    }

    if (role === 'client') {
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
                            <Paper sx={chartContainerStyles}>
                                <Typography variant="h6">Top Vulnerabilities</Typography>
                                <TopVulnerabilities vulnerabilities={topVulnerabilities}></TopVulnerabilities>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={chartContainerStyles}>
                                <Typography variant="h6">Filter by Severity</Typography>
                                <ReportsList
                                    reports={filteredReports}
                                    selectedSeverity={selectedSeverity}
                                    handleSeverityChange={handleSeverityChange}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Box>
        );
    }

    if (role === 'va') {
        const noReportsAvailable = reportsPerClient.length === 0 || reportsPerClient.every((client) => client.report_count == 0);
    
        return (
            <Box sx={evaluateLaunchStyles}>
                <Typography variant="h6" sx={{ marginTop: 4 }}>
                    Clients and Organisations Assigned to You
                </Typography>
                <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : users.length === 0 && organizations.length === 0 ? (
                        <Typography>No assigned clients or organisations found.</Typography>
                    ) : (
                        <List>
                            {users.map((user) => (
                                <ListItem key={user.user_id} sx={{ marginBottom: 1, padding: 1, borderRadius: 1, boxShadow: 1 }}>
                                    <ListItemText primary={`User: ${user.username}`} />
                                    <ListItemSecondaryAction>
                                        <Button variant="contained" onClick={() => handleUserButtonClick(user)}>
                                            Evaluate
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                            {organizations.map((org) => (
                                <ListItem key={org.organization_id} sx={{ marginBottom: 1, padding: 1, borderRadius: 1, boxShadow: 1 }}>
                                    <ListItemText primary={`Organisation: ${org.name}`} />
                                    <ListItemSecondaryAction>
                                        <Button variant="contained" onClick={() => handleOrganizationButtonClick(org)}>
                                            Evaluate
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
                <Paper sx={{ padding: 2, marginTop: 4 }}>
                    <Typography variant="h6">Reports Per Client</Typography>
                    {noReportsAvailable ? (
                        <Typography>No reports available for clients.</Typography>
                    ) : (
                        <ReportsPerClient reportsPerClient={reportsPerClient} />
                    )}
                </Paper>
            </Box>
        );
    }
    
    

    return null;
};

export default Dashboard;
export type { VulnerabilityReport };
