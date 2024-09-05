'use client';
import { fetchAndMatchReports, fetchReports, fetchUploadsClient, fetchUploadsOrganization, generateReportRequest } from "@/functions/requests";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import axios from 'axios';
import { Card, CardContent, Typography, Box, Grid, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Loader, ReportsContainer, MatchedPair, ReportCard, ButtonGroup, UnmatchedReports, UnmatchedButtonGroup, UnmatchedReportCard } from '../../../../../styles/conflictStyle';

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
    const [finalReport, setFinalReport] = useState<any[]>([]); // Initialize finalReport array
    const [selectedReports, setSelectedReports] = useState<{ left: number[], right: number[] }>({ left: [], right: [] });
    const [loading, setLoading] = useState(true);

    const [selectedUnmatchedReports, setSelectedUnmatchedReports] = useState<{ list1: number[], list2: number[] }>({ list1: [], list2: [] });

    const [snackbarOpen, setSnackbarOpen] = useState(false);

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
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {

            setTimeout(() => {
                setLoading(false);
            }, 2000);

        }
    };

    useEffect(() => {
        fetchUploadIDsForReport();
    }, [name, redirectToLogin]);

    useEffect(() => {
        if (reportIds.length > 0) {
            fetchReportsJSON();
        }
    }, [reportIds]);


    type UnmatchedReportCardProps = {
        vulnerability: any;
        isSelected: boolean;
        handleAdd: () => void;
        handleRemove: () => void;
    };

    const MemoizedUnmatchedReportCard = memo(({ vulnerability, isSelected, handleAdd, handleRemove }: UnmatchedReportCardProps) => (
        <UnmatchedReportCard selected={isSelected} theme={undefined}>
            <CardContent>
                {Object.entries(vulnerability).map(([key, value]) => (
                    <Typography key={key} variant="body2">
                        <strong>{key}:</strong> {value as React.ReactNode}
                    </Typography>
                ))}
                <UnmatchedButtonGroup>
                    <Button variant="contained" color="primary" onClick={handleAdd}>
                        <CheckCircleIcon />
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleRemove}>
                        <CancelIcon />
                    </Button>
                </UnmatchedButtonGroup>
            </CardContent>
        </UnmatchedReportCard>
    ));


    const isUnmatchedReportSelected = useCallback((index: number, listType: 'list1' | 'list2') => {
        return selectedUnmatchedReports[listType].includes(index);
    }, [selectedUnmatchedReports]);


    const handleUnmatchedReport = useCallback((action: string, index: number, listType: 'list1' | 'list2') => {
        setFinalReport((prevFinalReport) => {
            const updatedReport = [...prevFinalReport];
            const reportToUpdate = listType === 'list1' ? unmatchedList1[index] : unmatchedList2[index];

            if (action === 'add') {
                updatedReport.push(reportToUpdate);
            } else if (action === 'remove') {
                return updatedReport.filter((r) => r !== reportToUpdate);
            }
            return updatedReport;
        });

        setSelectedUnmatchedReports((prevSelectedReports) => {
            const updatedSelectedReports = { ...prevSelectedReports };

            if (action === 'add') {
                updatedSelectedReports[listType] = [...updatedSelectedReports[listType], index];
            } else if (action === 'remove') {
                updatedSelectedReports[listType] = updatedSelectedReports[listType].filter((i: any) => i !== index);
            }
            return updatedSelectedReports;
        });
        console.log('Final Report:', finalReport);
    }, [unmatchedList1, unmatchedList2]);


    const unmatchedReportsList1 = useMemo(() =>
        unmatchedList1.map((vulnerability, index) => (
            <MemoizedUnmatchedReportCard
                key={index}
                vulnerability={vulnerability}
                isSelected={isUnmatchedReportSelected(index, 'list1')}
                handleAdd={() => handleUnmatchedReport('add', index, 'list1')}
                handleRemove={() => handleUnmatchedReport('remove', index, 'list1')}
            />
        )),
        [unmatchedList1, isUnmatchedReportSelected, handleUnmatchedReport]
    );

    // Memoized unmatched reports for List 2
    const unmatchedReportsList2 = useMemo(() =>
        unmatchedList2.map((vuln, index) => (
            <MemoizedUnmatchedReportCard
                key={index}
                vulnerability={vuln}
                isSelected={isUnmatchedReportSelected(index, 'list2')}
                handleAdd={() => handleUnmatchedReport('add', index, 'list2')}
                handleRemove={() => handleUnmatchedReport('remove', index, 'list2')}
            />
        )),
        [unmatchedList2, isUnmatchedReportSelected, handleUnmatchedReport]
    );

    const MemoizedReportCard = memo(({ report, isSelected }: { report: any; isSelected: boolean }) => (
        <ReportCard sx={{ border: isSelected ? '4px solid #4caf50' : 'none' }}>
            <CardContent>
                {Object.entries(report).map(([key, value]) => (
                    <Typography key={key} variant="body2">
                        <strong>{key}:</strong> {value as React.ReactNode}
                    </Typography>
                ))}
            </CardContent>
        </ReportCard>
    ));

    // Memoized render function using useMemo
    const renderReport = useMemo(
        () => {
            return (report: any, isSelected: boolean) => (
                <MemoizedReportCard report={report} isSelected={isSelected} />
            );
        },
        []
    );

    const handleButtonClick = (action: string, index: number) => {
        const updatedReportSet = new Set(finalReport);
        const updatedSelectedReports = { ...selectedReports };

        if (action === 'acceptLeft') {
            updatedReportSet.add(matchedReports[index][0]);
            updatedSelectedReports.left.push(index);
        } else if (action === 'acceptRight') {
            updatedReportSet.add(matchedReports[index][1]);
            updatedSelectedReports.right.push(index);
        } else if (action === 'acceptBoth') {
            updatedReportSet.add(matchedReports[index][0]);
            updatedReportSet.add(matchedReports[index][1]);
            updatedSelectedReports.left.push(index);
            updatedSelectedReports.right.push(index);
        } else if (action === 'acceptNone') {

            updatedReportSet.delete(matchedReports[index][0]);
            updatedReportSet.delete(matchedReports[index][1]);
            updatedSelectedReports.left = updatedSelectedReports.left.filter((i) => i !== index);
            updatedSelectedReports.right = updatedSelectedReports.right.filter((i) => i !== index);
        }

        setFinalReport(Array.from(updatedReportSet)); // Convert Set back to array
        setSelectedReports(updatedSelectedReports);
        console.log('Final Report:', Array.from(updatedReportSet));
    };



    const renderedMatchedReports = useMemo(
        () =>
            matchedReports.map(([report1, report2], index) => (
                <MatchedPair key={index}>
                    <Box display="flex" width="100%" justifyContent="space-between" alignItems="center">
                        {renderReport(report1, selectedReports.left.includes(index))}
                        <ButtonGroup>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleButtonClick('acceptRight', index)}
                            >
                                <ArrowForwardIcon />
                            </Button>
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
                                onClick={() => handleButtonClick('acceptBoth', index)}
                            >
                                <CheckCircleIcon />
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleButtonClick('acceptNone', index)}
                            >
                                <CancelIcon />
                            </Button>
                        </ButtonGroup>
                        {renderReport(report2, selectedReports.right.includes(index))}
                    </Box>
                </MatchedPair>
            )),
        [matchedReports, selectedReports, renderReport] // Dependencies to trigger re-render
    );






    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };


    const generateReport = async () => {
        try {
            const response = await generateReportRequest(finalReport, name, type);
            console.log('Report generated successfully:', response);
            setSnackbarOpen(true);

            setTimeout(() => {
                router.push('/evaluate');
            }, 1500);
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };

    if (loading) {
        return (
            <Box sx={{
                ...mainContentStyles,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',

            }}>

                {/* <Typography sx={mainContentStyles} variant="h6" gutterBottom>Analyzing Reports...</Typography> */}

                <Loader />
            </Box>
        );
    }

    return (

        <ReportsContainer sx={mainContentStyles}>
            <Snackbar
                sx={{
                    width: '100%',
                    position: 'absolute',

                }}
                open={snackbarOpen}
                autoHideDuration={1500}
                onClose={handleCloseSnackbar}
                message="Report generated successfully"
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
            </Snackbar>
            <Box>
                <Typography variant="h4" gutterBottom>Matched Reports</Typography>
                {renderedMatchedReports}
            </Box>
            <UnmatchedReports>
                <Typography variant="h5" gutterBottom>Unmatched List 1</Typography>
                {unmatchedReportsList1}

                <Typography variant="h5" gutterBottom>Unmatched List 2</Typography>
                {unmatchedReportsList2}
            </UnmatchedReports>
            <Button
                variant="contained"
                color="primary"
                onClick={generateReport}
                sx={{ marginTop: 2, marginBottom: 2, width: '100%' }}
            >
                Generate Report
            </Button>

        </ReportsContainer>
    );
};

export default UserConflicts;
