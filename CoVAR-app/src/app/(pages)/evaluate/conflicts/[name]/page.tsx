'use client';
import { fetchAndMatchReports, fetchReports, fetchUploadsClient, fetchUploadsOrganization, generateReportRequest, unmatchedRecomendations } from "@/functions/requests";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import { Card, CardContent, Typography, Box, Grid, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { styled } from '@mui/system';
import { mainContentStyles } from '../../../../../styles/evaluateStyle';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

interface FileUpload {
    upload_id: number;
    va: number;
    client: string | null;
    organization: string | null;
    type: string;
    created_at: string;
    loid: number;
    filename: string;
    in_report?: boolean;
}

const ReportsContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    overflow: 'auto',
}));

const MatchedPair = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const ReportCard = styled(Card)(({ theme }) => ({
    width: '48%',
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: theme.spacing(2, 0),
    width: '10%',
    gap: theme.spacing(1),
}));

const UnmatchedButtonGroup = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    gap: theme.spacing(1),
}));

const UnmatchedReports = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

const UnmatchedReportCard = styled(Card)(({ theme, selected }: { theme: any; selected: boolean }) => ({
    marginBottom: theme.spacing(2),
    border: selected ? `4px solid ${theme.palette.success.main}` : 'none',
}));

const UserConflicts = () => {
    const router = useRouter();
    const redirectToLogin = useCallback(() => {
        router.replace('/login');
    }, [router]);

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const type = searchParams.get('type');
    const name = pathname.split('/').pop();

    const [reportIds, setReportIds] = useState<number[]>([]);
    const [matchedReports, setMatchedReports] = useState<any[]>([]);
    const [unmatchedList1, setUnmatchedList1] = useState<any[]>([]);
    const [unmatchedList2, setUnmatchedList2] = useState<any[]>([]);
    const [finalReport, setFinalReport] = useState<any[]>([]);
    const [selectedReports, setSelectedReports] = useState<{ left: number[], right: number[] }>({ left: [], right: [] });
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<{ [key: string]: string }>({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentInsight, setCurrentInsight] = useState<string | null>(null);

    const fetchUploadIDsForReport = async () => {
        try {
            if (name && type === 'client') {
                const data = await fetchUploadsClient(name);
                const inReportIds = data.filter((upload: FileUpload) => upload.in_report).map((upload: FileUpload) => upload.upload_id);
                setReportIds(inReportIds);
            }
            if (name && type === 'org') {
                const data = await fetchUploadsOrganization(name);
                const inReportIds = data.filter((upload: FileUpload) => upload.in_report).map((upload: FileUpload) => upload.upload_id);
                setReportIds(inReportIds);
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                redirectToLogin();
            }
        }
    };

    const fetchReportsJSON = async () => {
        try {
            const { matches, unmatchedList1, unmatchedList2 } = await fetchAndMatchReports(reportIds) as { matches: any[]; unmatchedList1: any[]; unmatchedList2: any[]; };
            setMatchedReports(matches);
            setUnmatchedList1(unmatchedList1);
            setUnmatchedList2(unmatchedList2);
            await Promise.all([fetchInsights(unmatchedList1), fetchInsights(unmatchedList2)]);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInsights = async (unmatchedReports: any[]) => {
        const insightsMap: { [key: string]: string } = {};

        for (const report of unmatchedReports) {
            try {
                const chainPrompt = report.nvtName;
                const result = await unmatchedRecomendations(chainPrompt);
                insightsMap[report.id] = result;
            } catch (error) {
                console.error('Error fetching insight for report:', report.id, error);
            }
        }

        setInsights(prevInsights => ({
            ...prevInsights,
            ...insightsMap
        }));
    };

    useEffect(() => {
        fetchUploadIDsForReport();
    }, [name, redirectToLogin]);

    useEffect(() => {
        if (reportIds.length > 0) {
            fetchReportsJSON();
        }
    }, [reportIds]);

    const renderReport = (report: any, isSelected: boolean) => (
        <ReportCard sx={{ border: isSelected ? '4px solid #4caf50' : 'none' }}>
            <CardContent>
                {Object.entries(report).map(([key, value]) => (
                    <Typography key={key} variant="body2">
                        <strong>{key}:</strong> {value as React.ReactNode}
                    </Typography>
                ))}
            </CardContent>
        </ReportCard>
    );

    const handleButtonClick = (action: string, index: number) => {
        let updatedReport = [...finalReport];
        let updatedSelectedReports = { ...selectedReports };

        if (action === 'acceptLeft') {
            updatedReport.push(matchedReports[index][0]);
            updatedSelectedReports.left.push(index);
        } else if (action === 'acceptRight') {
            updatedReport.push(matchedReports[index][1]);
            updatedSelectedReports.right.push(index);
        } else if (action === 'acceptBoth') {
            updatedReport.push(matchedReports[index][0], matchedReports[index][1]);
            updatedSelectedReports.left.push(index);
            updatedSelectedReports.right.push(index);
        } else if (action === 'acceptNone') {
            updatedReport = updatedReport.filter(
                (report) => report !== matchedReports[index][0] && report !== matchedReports[index][1]
            );
            updatedSelectedReports.left = updatedSelectedReports.left.filter((i) => i !== index);
            updatedSelectedReports.right = updatedSelectedReports.right.filter((i) => i !== index);
        }

        setFinalReport(updatedReport);
        setSelectedReports(updatedSelectedReports);
        console.log('Final Report:', updatedReport);
    };

    const handleOpenDialog = (reportId: string) => {
        const insight = insights[reportId];
        setCurrentInsight(insight || null);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setCurrentInsight(null);
    };

    const renderUnmatchedReport = (report: any, index: number) => {
        const isSelected = finalReport.includes(report);
        const reportId = report.id;
        const insightAvailable = insights[reportId];

        return (
            <UnmatchedReportCard key={index} selected={isSelected} theme={undefined}>
                <CardContent>
                    {Object.entries(report).map(([key, value]) => (
                        <Typography key={key} variant="body2">
                            <strong>{key}:</strong> {value as React.ReactNode}
                        </Typography>
                    ))}
                    <UnmatchedButtonGroup>
                        <Button variant="contained" color="primary" onClick={() => handleUnmatchedReport('add', report)}>
                            <CheckCircleIcon />
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => handleUnmatchedReport('remove', report)}>
                            <CancelIcon />
                        </Button>
                        <Button variant="outlined" color="info" onClick={() => handleOpenDialog(reportId)}>
                            {insightAvailable ? "Show Insight" : <CircularProgress size={20} />}
                        </Button>
                    </UnmatchedButtonGroup>
                </CardContent>
            </UnmatchedReportCard>
        );
    };

    const handleUnmatchedReport = (action: string, report: any) => {
        let updatedReport = [...finalReport];

        if (action === 'add') {
            updatedReport.push(report);
        } else if (action === 'remove') {
            updatedReport = updatedReport.filter((r) => r.id !== report.id);
        }

        setFinalReport(updatedReport);
        console.log('Final Report:', updatedReport);
    };

    const saveFinalReport = async () => {
        try {
            await generateReportRequest(finalReport);
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error saving final report:', error);
        }
    };

    return (
        <ReportsContainer sx={mainContentStyles}>
            <Typography variant="h6">Conflicts</Typography>
            <Grid container spacing={2}>
                {matchedReports.map((match, index) => (
                    <MatchedPair key={index}>
                        {renderReport(match[0], selectedReports.left.includes(index))}
                        <ButtonGroup>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleButtonClick('acceptLeft', index)}
                            >
                                <ArrowBackIcon />
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleButtonClick('acceptRight', index)}
                            >
                                <ArrowForwardIcon />
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleButtonClick('acceptBoth', index)}
                            >
                                Accept Both
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleButtonClick('acceptNone', index)}
                            >
                                Accept None
                            </Button>
                        </ButtonGroup>
                        {renderReport(match[1], selectedReports.right.includes(index))}
                    </MatchedPair>
                ))}
            </Grid>

            <UnmatchedReports>
                <Typography variant="h6">Unmatched Reports</Typography>
                {unmatchedList1.map((report, index) => renderUnmatchedReport(report, index))}
                {unmatchedList2.map((report, index) => renderUnmatchedReport(report, index))}
            </UnmatchedReports>

            <Button
                variant="contained"
                color="primary"
                onClick={saveFinalReport}
                sx={{ marginTop: 2 }}
            >
                Save Final Report
            </Button>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success">
                    Report saved successfully!
                </Alert>
            </Snackbar>

            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Insight</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        {currentInsight}
                    </Typography>
                </DialogContent>
            </Dialog>
        </ReportsContainer>
    );
};

export default UserConflicts;
