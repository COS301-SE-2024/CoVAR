'use client';
import { fetchAndMatchReports, fetchUploadsClient, fetchUploadsOrganization, generateReportRequest } from "@/functions/requests";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { CardContent, Typography, Box, Button, CircularProgress, Backdrop } from '@mui/material';
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
    const [generatingReport, setGeneratingReport] = useState(false);
    const [success, setSuccess] = useState(false);

    const [selectedUnmatchedReports, setSelectedUnmatchedReports] = useState<{ list1: number[], list2: number[] }>({ list1: [], list2: [] });


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

    useEffect(() => {
        console.log('Final Report:', finalReport);
    }, [finalReport]);

    const handleUnmatchedReport = (action: string, index: number, listType: 'list1' | 'list2') => {

        const updatedReportSet = new Set(finalReport);
        const updatedSelectedUnmatchedReports = { ...selectedUnmatchedReports };

        if (action === 'add') {
            updatedReportSet.add(listType === 'list1' ? unmatchedList1[index] : unmatchedList2[index]);
            updatedSelectedUnmatchedReports[listType].push(index);
        } else if (action === 'remove') {
            updatedReportSet.delete(listType === 'list1' ? unmatchedList1[index] : unmatchedList2[index]);
            updatedSelectedUnmatchedReports[listType] = updatedSelectedUnmatchedReports[listType].filter((i) => i !== index);
        }

        setFinalReport(Array.from(updatedReportSet));
        setSelectedUnmatchedReports(updatedSelectedUnmatchedReports);
    };


    const unmatchedReportsList1 = useMemo(() => (
        <>
            <Typography variant="h5" gutterBottom>Unmatched List 1</Typography>
            <Button onClick={() => selectAllReports('unmatched1')}>Select All</Button>
            <Button onClick={() => deselectAllReports('unmatched1')}>Deselect All</Button>
            {unmatchedList1.map((vulnerability, index) => (
                <MemoizedUnmatchedReportCard
                    key={index}
                    vulnerability={vulnerability}
                    isSelected={isUnmatchedReportSelected(index, 'list1')}
                    handleAdd={() => handleUnmatchedReport('add', index, 'list1')}
                    handleRemove={() => handleUnmatchedReport('remove', index, 'list1')}
                />
            ))}
        </>
    ), [unmatchedList1, isUnmatchedReportSelected, handleUnmatchedReport]);


    const unmatchedReportsList2 = useMemo(() => (
        <>
            <Typography variant="h5" gutterBottom>Unmatched List 2</Typography>
            <Button onClick={() => selectAllReports('unmatched2')}>Select All</Button>
            <Button onClick={() => deselectAllReports('unmatched2')}>Deselect All</Button>
            {unmatchedList2.map((vuln, index) => (
                <MemoizedUnmatchedReportCard
                    key={index}
                    vulnerability={vuln}
                    isSelected={isUnmatchedReportSelected(index, 'list2')}
                    handleAdd={() => handleUnmatchedReport('add', index, 'list2')}
                    handleRemove={() => handleUnmatchedReport('remove', index, 'list2')}
                />
            ))}
        </>
    ), [unmatchedList2, isUnmatchedReportSelected, handleUnmatchedReport]);

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

        setFinalReport(Array.from(updatedReportSet));
        setSelectedReports(updatedSelectedReports);
        console.log('Final Report:', Array.from(updatedReportSet));
    };

    const selectAllReports = (listType: 'matchedLeft' | 'matchedRight' | 'unmatched1' | 'unmatched2') => {
        const updatedFinalReport = new Set(finalReport);
        const updatedSelectedReports = { ...selectedReports };
        const updatedSelectedUnmatchedReports = { ...selectedUnmatchedReports };

        if (listType === 'matchedLeft') {
            matchedReports.forEach(([leftReport], index) => {
                if (!updatedFinalReport.has(leftReport)) {
                    updatedFinalReport.add(leftReport);
                    updatedSelectedReports.left.push(index);
                }
            });
        } else if (listType === 'matchedRight') {
            matchedReports.forEach(([, rightReport], index) => {
                if (!updatedFinalReport.has(rightReport)) {
                    updatedFinalReport.add(rightReport);
                    updatedSelectedReports.right.push(index);
                }
            });
        } else if (listType === 'unmatched1') {
            unmatchedList1.forEach((report, index) => {
                if (!updatedFinalReport.has(report)) {
                    updatedFinalReport.add(report);
                    updatedSelectedUnmatchedReports.list1.push(index);
                }
            });
        } else if (listType === 'unmatched2') {
            unmatchedList2.forEach((report, index) => {
                if (!updatedFinalReport.has(report)) {
                    updatedFinalReport.add(report);
                    updatedSelectedUnmatchedReports.list2.push(index);
                }
            });
        }

        setFinalReport(Array.from(updatedFinalReport));
        setSelectedReports(updatedSelectedReports);
        setSelectedUnmatchedReports(updatedSelectedUnmatchedReports);
    };

    const deselectAllReports = (listType: 'matchedLeft' | 'matchedRight' | 'unmatched1' | 'unmatched2') => {
        const updatedFinalReport = new Set(finalReport);
        const updatedSelectedReports = { ...selectedReports };
        const updatedSelectedUnmatchedReports = { ...selectedUnmatchedReports };

        if (listType === 'matchedLeft') {
            matchedReports.forEach(([leftReport], index) => {
                updatedFinalReport.delete(leftReport);
                updatedSelectedReports.left = updatedSelectedReports.left.filter((i) => i !== index);
            });
        } else if (listType === 'matchedRight') {
            matchedReports.forEach(([, rightReport], index) => {
                updatedFinalReport.delete(rightReport);
                updatedSelectedReports.right = updatedSelectedReports.right.filter((i) => i !== index);
            });
        } else if (listType === 'unmatched1') {
            unmatchedList1.forEach((report, index) => {
                updatedFinalReport.delete(report);
                updatedSelectedUnmatchedReports.list1 = updatedSelectedUnmatchedReports.list1.filter((i) => i !== index);
            });
        } else if (listType === 'unmatched2') {
            unmatchedList2.forEach((report, index) => {
                updatedFinalReport.delete(report);
                updatedSelectedUnmatchedReports.list2 = updatedSelectedUnmatchedReports.list2.filter((i) => i !== index);
            });
        }

        setFinalReport(Array.from(updatedFinalReport));
        setSelectedReports(updatedSelectedReports);
        setSelectedUnmatchedReports(updatedSelectedUnmatchedReports);
    };

    const renderedMatchedReports = useMemo(
        () => (
            <>
                <Typography variant="h4" gutterBottom>Matched Reports</Typography>
                <Box display="flex" justifyContent="space-between" width="100%">
                    <Box display="flex" gap={2} justifyContent="flex-start">
                        <Button onClick={() => selectAllReports('matchedLeft')}>Select All Left</Button>
                        <Button onClick={() => deselectAllReports('matchedLeft')}>Deselect All Left</Button>
                    </Box>
                    <Box display="flex" gap={2} justifyContent="center">
                        <Button onClick={() => selectAllReports('matchedRight')}>Select All Right</Button>
                        <Button onClick={() => deselectAllReports('matchedRight')}>Deselect All Right</Button>
                    </Box>
                </Box>
                {matchedReports.map(([report1, report2], index) => (
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
                ))}
            </>
        ),
        [matchedReports, selectedReports, renderReport]
    );




    const generateReport = async () => {
        try {
            setGeneratingReport(true);
            const response = await generateReportRequest(finalReport, name, type);
            console.log('Report generated successfully:', response);


            setTimeout(() => {
                setSuccess(true);
            }, 1000);

            setTimeout(() => {
                router.push('/evaluate');
            }, 1000);
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
                <Loader />
            </Box>
        );
    }



    return (

        <ReportsContainer sx={mainContentStyles}>
            {matchedReports.length > 0 && (
                <Box>
                    {renderedMatchedReports}
                </Box>
            )}
            <UnmatchedReports>
                {unmatchedList1.length > 0 && (
                    unmatchedReportsList1
                )}
                {unmatchedList2.length > 0 && (
                    unmatchedReportsList2
                )}
            </UnmatchedReports>
            <Button
                variant="contained"
                color="primary"
                onClick={generateReport}
                sx={{ marginTop: 2, marginBottom: 2, width: '100%' }}
            >
                Generate Report
            </Button>
            <Backdrop open={generatingReport} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }}>
                {success ? <Typography variant="h6">Generated Successfully!</Typography> : <Loader />}
            </Backdrop>
        </ReportsContainer>
    );
};

export default UserConflicts;
