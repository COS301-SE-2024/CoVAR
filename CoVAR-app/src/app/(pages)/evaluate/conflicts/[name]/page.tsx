'use client';
import { fetchReports, fetchUploadsClient, fetchUploadsOrganization } from "@/functions/requests";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import { Card, CardContent, Typography, Box, Grid, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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

const userConflicts = () => {
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
    const [finalReport, setFinalReport] = useState<any[]>([]); // Initialize finalReport array
    const [selectedReports, setSelectedReports] = useState<{ left: number[], right: number[] }>({ left: [], right: [] });

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
            if (reportIds.length > 0) {
                const fetchedReports = await fetchReports(reportIds);

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
            }
        } catch (error) {
            console.error('Error generating reports:', error);
        }
    };

    useEffect(() => {
        fetchUploadIDsForReport();
    }, [name, redirectToLogin]);

    useEffect(() => {
        fetchReportsJSON();
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
            // Remove selected reports
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

    const handleUnmatchedReport = (action: string, report: any) => {
        let updatedReport = [...finalReport];

        if (action === 'add') {
            updatedReport.push(report);
        } else if (action === 'remove') {
            updatedReport = updatedReport.filter((r) => r !== report);
        }

        setFinalReport(updatedReport);
        console.log('Final Report:', updatedReport);
    };

    const generateReport = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          
          const response = await axios.post(
            '/api/uploads/generateReport',
            { finalReport, name, type },    
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log('Report generated successfully:', response.data);
        } catch (error) {
          console.error('Error generating report:', error);
        }
      };
    

    return (
        <ReportsContainer sx={mainContentStyles}>
            <Box>
                <Typography variant="h5" gutterBottom>Identified Similarities</Typography>
                {matchedReports.map(([report1, report2]: [any, any], index: number) => (
                    <MatchedPair key={index}>
                        <Box display="flex" width="100%" justifyContent="space-between" alignItems="center">
                            {renderReport(report1, selectedReports.left.includes(index))}
                            <ButtonGroup>
                                <Button variant="contained" color="primary" onClick={() => handleButtonClick('acceptRight', index)}>
                                    <ArrowForwardIcon />
                                </Button>
                                <Button variant="contained" color="primary" onClick={() => handleButtonClick('acceptLeft', index)}>
                                    <ArrowBackIcon />
                                </Button>
                                <Button variant="contained" color="primary" onClick={() => handleButtonClick('acceptBoth', index)}>
                                    <CheckCircleIcon />
                                </Button>
                                <Button variant="contained" color="primary" onClick={() => handleButtonClick('acceptNone', index)}>
                                    <CancelIcon />
                                </Button>
                            </ButtonGroup>
                            {renderReport(report2, selectedReports.right.includes(index))}
                        </Box>
                    </MatchedPair>
                ))}
            </Box>
            <UnmatchedReports>
                <Typography variant="h5" gutterBottom>Unmatched List 1</Typography>
                {unmatchedList1.map((report: any, index: number) => {
                    const isSelected = finalReport.includes(report);
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
                                </UnmatchedButtonGroup>
                            </CardContent>
                        </UnmatchedReportCard>
                    );
                })}

                <Typography variant="h5" gutterBottom>Unmatched List 2</Typography>
                {unmatchedList2.map((report: any, index: number) => {
                    const isSelected = finalReport.includes(report);
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
                                </UnmatchedButtonGroup>
                            </CardContent>
                        </UnmatchedReportCard>
                    );
                })}
            </UnmatchedReports>
            <Button
                variant="contained"
                color="primary"
                onClick={generateReport}
                sx={{ marginTop: 2 , marginBottom: 2, width: '100%' }}
            >
                Generate Report
            </Button>
        </ReportsContainer>
    );
};

export default userConflicts;
