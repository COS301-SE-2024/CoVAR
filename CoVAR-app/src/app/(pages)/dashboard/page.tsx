'use client';
import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import { chartContainerStyles } from '../../../styles/dashboardStyle';
import SeverityDistribution from './components/severityDistribution';
import VulnerabilityLineChart from './components/lineChart';
import ReportsList from './components/reportsList';
import TopVulnerabilities from './components/topVulnerabilities';
import { fetchLastReportDates, getAllReports, getUserRole, fetchClientsAssigned, fetchOrganisationsAssigned } from '@/functions/requests';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { evaluateLaunchStyles } from '../../../styles/evaluateStyle';
import { fetchReportsPerClient } from '@/functions/requests';
import ReportsPerClient from './components/reportsPerClient';
import AdminPage from './components/adminPage';

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

interface LastReportDate {
    client_name: string;
    last_report_date: string;
}

interface LastReportDateOrganization {
    organization_name: string;
    last_report_date: string;
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
    const [lastReportDatesClients, setLastReportDatesClients] = useState<LastReportDate[]>([]);
    const [lastReportDatesOrgs, setLastReportDatesOrgs] = useState<LastReportDateOrganization[]>([]);

    const router = useRouter();

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

            if (responseData) {
                const reports = responseData[0].content.finalReport;
                calculateSeverityDistribution(reports);
                setTopVulnerabilities(reports.sort((a: VulnerabilityReport, b: VulnerabilityReport) => parseFloat(b.CVSS) - parseFloat(a.CVSS)).slice(0, 5));
                setAllReports(reports);
                setFilteredReports(reports);
            }

        } catch (error) {
            console.log(error);
        }
    };

    const fetchAssignedUsersAndOrgs = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const userId = userID;
            console.log(userId);
            const [clients, orgs, reportDates] = await Promise.all([
                fetchClientsAssigned(token as string),
                fetchOrganisationsAssigned(token as string),
                fetchLastReportDates(token as string)
            ]);
            console.log(clients);
            console.log(orgs);
            console.log('Report Dates:', reportDates);
    
            setUsers(clients);
            setOrganizations(orgs);
            setLastReportDatesClients(reportDates.clients);
            setLastReportDatesOrgs(reportDates.organizations);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const formatDate = (dateString: string) => {
        if (!dateString) return 'No report';
        const date = new Date(dateString);
        
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const formattedTime = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        return `${formattedDate} ${formattedTime}`;
    };


    const getReportsPerClient = async () => {
        try {
            const data: ClientReport[] = await fetchReportsPerClient();
            const formattedData = data.map((client: ClientReport) => ({
                client_name: client.client_name,
                report_count: client.report_count
            }));
            setReportsPerClient(formattedData);
        } catch (error) {
            console.error('Error fetching reports per client:', error);
        }
    };

    useEffect(() => {
        fetchUserRole();
    }, []);

    useEffect(() => {
        if (role === 'client') {
            fetchReports();
        }

        if (role === 'va') {
            fetchAssignedUsersAndOrgs();
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
                <Typography variant="h6">Assigned Clients and Organisations</Typography>
                <Paper elevation={3} sx={{ padding: 2, marginBottom: 2, marginTop: 2 }}>
                    {noReportsAvailable ? (
                        <Typography>No reports data available.</Typography>
                    ) : (
                        <ReportsPerClient reportsPerClient={reportsPerClient} />
                    )}
                </Paper>
                <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                    {users.length === 0 && organizations.length === 0 ? (
                        <Typography>No assigned clients or organisations found.</Typography>
                    ) : (
                    <List>
                        {users.map((user) => (
                            <ListItem key={user.user_id} sx={{ marginBottom: 1, padding: 1, borderRadius: 1, boxShadow: 1 }}>
                                <ListItemText
                                    primary={`User: ${user.username}`}
                                    secondary={`Last Report: ${formatDate(lastReportDatesClients.find(c => c.client_name === user.username)?.last_report_date as string) || 'No report'}`}
                                />
                                <ListItemSecondaryAction>
                                    <Button variant="contained" onClick={() => handleUserButtonClick(user)}>
                                        Evaluate
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                        {organizations.map((org) => (
                            <ListItem key={org.organization_id} sx={{ marginBottom: 1, padding: 1, borderRadius: 1, boxShadow: 1 }}>
                                <ListItemText
                                    primary={`Organisation: ${org.name}`}
                                    secondary={`Last Report: ${formatDate(lastReportDatesOrgs.find(o => o.organization_name === org.name)?.last_report_date as string) || 'No report' }`}
                                />
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
            </Box>
        );
    }

    if (role === 'admin') {
        return (
            <Box sx={mainContentStyles}>
                <AdminPage />
            </Box>
        );
    }
    

    return null;
};

export default Dashboard;
export type { VulnerabilityReport };
