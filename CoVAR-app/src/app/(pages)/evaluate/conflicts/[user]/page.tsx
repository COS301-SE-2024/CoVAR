'use client';
import { fetchReports, fetchUploadsClient } from "@/functions/requests";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import { Card, CardContent, Typography, Box, Grid, Button } from '@mui/material';
import { styled } from '@mui/system';
import { mainContentStyles } from '../../../../../styles/evaluateStyle';

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

const ReportRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
}));

const ReportCard = styled(Card)(({ theme }) => ({
    width: '48%',
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: theme.spacing(2, 0),
}));

const UnmatchedReports = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

const UnmatchedReportCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const userConflicts = () => {
    const router = useRouter();
    const redirectToLogin = useCallback(() => {
        router.replace('/login');
    }, [router]);
    const pathname = usePathname();
    const username = pathname.split('/').pop();

    const [reportIds, setReportIds] = useState<number[]>([]);
    const [reports, setReports] = useState<any[][]>([]);
    const [matchedReports, setMatchedReports] = useState<any[]>([]);
    const [unmatchedList1, setUnmatchedList1] = useState<any[]>([]);
    const [unmatchedList2, setUnmatchedList2] = useState<any[]>([]);

    const fetchUploadIDsForReport = async () => {
        try {
            if (username) {
                const data = await fetchUploadsClient(username);
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
            if (reportIds.length > 0) {
                const fetchedReports = await fetchReports(reportIds);
                console.log(fetchedReports);
                setReports(fetchedReports);

                const token = localStorage.getItem('accessToken');

                const response = await axios.post('/api/conflicts/match', {
                    listUploads: fetchedReports,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const { matches, unmatchedList1, unmatchedList2 } = response.data;
                setMatchedReports(matches);
                setUnmatchedList1(unmatchedList1);
                setUnmatchedList2(unmatchedList2);
            } else {
                setReports([]);
            }
        } catch (error) {
            console.error('Error generating reports:', error);
        }
    };

    useEffect(() => {
        fetchUploadIDsForReport();
    }, [username, redirectToLogin]);

    useEffect(() => {
        fetchReportsJSON();
    }, [reportIds]);

    const renderReport = (report: any) => (
        <ReportCard>
            <CardContent>
                {Object.entries(report).map(([key, value]) => (
                    <Typography key={key} variant="body2">
                        <strong>{key}:</strong> {value as React.ReactNode}
                    </Typography>
                ))}
            </CardContent>
        </ReportCard>
    );

    const handleButtonClick = (action: string) => {
        console.log(`Action selected: ${action}`);
        // Implement logic for handling the selected action (Accept Right, Accept Left, Accept Both, Accept None)
    };

    return (
        <ReportsContainer sx={mainContentStyles}>
            <Box>
                <Typography variant="h5" gutterBottom>Matched Reports</Typography>
                {matchedReports.map(([report1, report2]: [any, any], index: number) => (
                    <MatchedPair key={index}>
                        <Box display="flex" width="100%" justifyContent="space-between" alignItems="center">

                            {renderReport(report1)}


                            <ButtonGroup>
                                <Button variant="contained" color="primary" onClick={() => handleButtonClick('acceptRight')}>
                                    Accept Right
                                </Button>
                                <Button variant="contained" color="primary" onClick={() => handleButtonClick('acceptLeft')}>
                                    Accept Left
                                </Button>
                                <Button variant="contained" color="primary" onClick={() => handleButtonClick('acceptBoth')}>
                                    Accept Both
                                </Button>
                                <Button variant="contained" color="primary" onClick={() => handleButtonClick('acceptNone')}>
                                    Accept None
                                </Button>
                            </ButtonGroup>


                            {renderReport(report2)}

                        </Box>
                    </MatchedPair>
                ))}
            </Box>
            <UnmatchedReports>
                <Typography variant="h5" gutterBottom>Unmatched Reports List 1</Typography>
                {unmatchedList1.map((report: any, index: number) => (
                    <UnmatchedReportCard key={index}>
                        <CardContent>
                            {Object.entries(report).map(([key, value]) => (
                                <Typography key={key} variant="body2">
                                    <strong>{key}:</strong> {value as React.ReactNode}
                                </Typography>
                            ))}
                        </CardContent>
                    </UnmatchedReportCard>
                ))}
                <Typography variant="h5" gutterBottom>Unmatched Reports List 2</Typography>
                {unmatchedList2.map((report: any, index: number) => (
                    <UnmatchedReportCard key={index}>
                        <CardContent>
                            {Object.entries(report).map(([key, value]) => (
                                <Typography key={key} variant="body2">
                                    <strong>{key}:</strong> {value as React.ReactNode}
                                </Typography>
                            ))}
                        </CardContent>
                    </UnmatchedReportCard>
                ))}
            </UnmatchedReports>
        </ReportsContainer>
    );
};

export default userConflicts;
