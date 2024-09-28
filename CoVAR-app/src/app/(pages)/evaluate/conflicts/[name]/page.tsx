'use client';
import { fetchAndMatchReports, fetchUploadsClient, fetchUploadsOrganization, generateReportRequest } from "@/functions/requests";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { CardContent, Typography, Box, Button, CircularProgress, Backdrop, keyframes, styled, Card, Popover, Tooltip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Loader, ReportsContainer, MatchedPair, ReportCard, ButtonGroup, UnmatchedReports, UnmatchedButtonGroup } from '../../../../../styles/conflictStyle';
import { matchedRecomendations, unmatchedRecomendations } from '@/functions/requests';
import { mainContentStyles } from '../../../../../styles/evaluateStyle';

import InfoIcon from '@mui/icons-material/Info';

import Image from 'next/image';
import AIImage from '../../../../../assets/AIImage.png';
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
    const [aiInsight, setAiInsight] = useState(false);
    const [reportBatchIndex, setReportBatchIndex] = useState(0);
    const [reportIds, setReportIds] = useState<number[]>([]);
    const [matchedReports, setMatchedReports] = useState<any[]>([]);
    const [unmatchedList1, setUnmatchedList1] = useState<any[]>([]);
    const [unmatchedList2, setUnmatchedList2] = useState<any[]>([]);
    const [finalReport, setFinalReport] = useState<any[]>([]);
    const [selectedReports, setSelectedReports] = useState<{ left: number[], right: number[] }>({ left: [], right: [] });
    const [loading, setLoading] = useState(true);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [success, setSuccess] = useState(false);

    const [reportType1, setReportType1] = useState<string>('');
    const [reportType2, setReportType2] = useState<string>('');
    const [selectedUnmatchedReports, setSelectedUnmatchedReports] = useState<{ list1: number[], list2: number[] }>({ list1: [], list2: [] });
    const [aiSelections, setAiSelections] = useState<{ [index: number]: boolean }>({});
    const [unmatchedAiSelections1, setUnmatchedAiSelections1] = useState<{ [index: number]: boolean }>({});
    const [unmatchedAiSelections2, setUnmatchedAiSelections2] = useState<{ [index: number]: boolean }>({});
    const [matchedReportsExist, setMatchedReportsExist] = useState(false);

    const [matchedReportReccomendations, setMatchedReportReccomendations] = useState<string[]>([]);
    const [unmatchedReportReccomendations1, setUnmatchedReportReccomendations1] = useState<string[]>([]);
    const [unmatchedReportReccomendations2, setUnmatchedReportReccomendations2] = useState<string[]>([]);




    const [canGenerteReport, setCanGenerateReport] = useState(false);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const aiToggle = async () => {
        try {

            setAiInsight((prevState) => !prevState);
        } catch (error: any) {
            console.log("ERROR enabling or disabling ai insights", error);
        }
    };


    useEffect(() => {
        console.log('final report:', finalReport);
        console.log('aiSelect:', aiSelections);
        console.log('reccomendations:', matchedReportReccomendations);
    }
        , [finalReport]);

        useEffect(() => {
            // Only trigger when aiInsight is true
            if (aiInsight) {
        
                const fetchAllRecommendations = async () => {
                    // const scrollFixedDistance = () => {
                    //     const reportsContainer = document.querySelector('#reportsContainer');
                    //     if (reportsContainer) {
                    //         reportsContainer.scrollBy({
                    //             top: 600,
                    //             behavior: 'smooth'
                    //         });
                    //     }
                    // };
                    try {
                        let broken = "false";
        
                        // Process matched reports first
                        for (const [index, report] of matchedReports.entries()) {
                            try {
                                const result = await matchedRecomendations(report);
        
                                // Log the result to verify it's in the expected format
                                console.log("Recommendation result for matched report:", result);
        
                                // Check if the result has the 'result' property and if it's a string
                                if (result && typeof result.result === 'string') {
                                    const recommendation = result.result;
        
                                    // Get the first word of the recommendation
                                    const firstWord = recommendation.split(/\s+/)[0];
                                        setMatchedReportReccomendations(prev => [...prev, recommendation.split(' ').slice(1).join(' ')]);

                                    // Automatically select based on the first word
                                    if (firstWord === "Both") {
                                        handleButtonClick('acceptBoth', index, true);
                                    } else if (firstWord === "Vulnerability-1") {
                                        handleButtonClick('acceptLeft', index, true);
                                    } else if (firstWord === "Vulnerability-2") {
                                        handleButtonClick('acceptRight', index, true);
                                    } else {
                                        handleButtonClick('acceptNone', index, true);
                                    }
                                } else {
                                    console.warn("Unexpected result format for matched report:", result);
                                    handleButtonClick('acceptNone', index, true);
                                }
                            } catch (error: any) {
                                // Check if the error status is 502 or 500 and break out of the loop
                                if (error.response && (error.response.status === 502 || error.response.status === 500)) {
                                    console.error(`${error.response.status} error encountered. Exiting the process.`);
                                    broken = "true";
                                    break; // Break out of the loop if a 502 or 500 error is encountered
                                }
                                console.error("Error fetching recommendation for matched report:", report, error);
                            }
        
                            await sleep(200);
                        }
        
                        if (broken === "true") {
                            return;
                        }
        
                        // After completing the matched reports, process the unmatched ones
                        for (const [index, report] of unmatchedList1.entries()) {
                            try {
                                const result = await unmatchedRecomendations(report);
        
                                // Log the result to verify it's in the expected format
                                console.log("Recommendation result for unmatched report:", result);
        

                                // Check if the result has the 'result' property and if it's a string
                                if (result && typeof result.result === 'string') {
                                    const recommendation = result.result;
                                    const firstWord = recommendation.split(/\s+/)[0];
    
                                setUnmatchedReportReccomendations1(prev => [...prev, recommendation.split(' ').slice(1).join(' ')]);

                                if (firstWord === "Keep") {
                                        handleUnmatchedReport('add', index, 'list1', true);
                                    }
                                } else {
                                    console.warn("Unexpected result format for unmatched report:", result);
                                    handleButtonClick('acceptNone', index);
                                }
                            } catch (error: any) {
                                if (error.response && (error.response.status === 502 || error.response.status === 500)) {
                                    console.error(`${error.response.status} error encountered. Exiting the process.`);
                                    broken = "true";
                                    break; // Break out of the loop if a 502 or 500 error is encountered
                                }
                                console.error("Error fetching recommendation for unmatched report:", report, error);
                            }
        
                            await sleep(200);
                        }
        
                        if (broken === "true") {
                            return;
                        }
        
                        // Process the second unmatched list, unmatchedList2 (if required)
                        for (const [index, report] of unmatchedList2.entries()) {
                            try {
                                const result = await unmatchedRecomendations(report);
        
                                // Log the result to verify it's in the expected format
                                console.log("Recommendation result for unmatched report 2:", result);
        
                                const recommendation = result.result;
                                const firstWord = recommendation.split(/\s+/)[0];

                            setUnmatchedReportReccomendations2(prev => [...prev, recommendation.split(' ').slice(1).join(' ')]);

                                if (firstWord === "Keep") {
                                    handleUnmatchedReport('add', index, 'list2', true);
                                }
                            } catch (error: any) {
                                if (error.response && (error.response.status === 502 || error.response.status === 500)) {
                                    console.error(`${error.response.status} error encountered. Exiting the process.`);
                                    break; // Break out of the loop if a 502 or 500 error is encountered
                                }
                                console.error("Error fetching recommendation for unmatched report 2:", report, error);
                            }
        
                            await sleep(200);
                        }
                    } catch (error) {
                        console.error("Error during fetching recommendations:", error);
                    } finally {
                        setLoading(false); // Set loading to false after the process is complete
                    }
                };
        
                fetchAllRecommendations(); // Call the function
            }
        }, [aiInsight, matchedReports, unmatchedList1, unmatchedList2]);
    

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
            if (unmatchedList1.length > 0) {
                setReportType1(unmatchedList1[0].type);
            }
            if (unmatchedList2.length > 0) {
                setReportType2(unmatchedList2[0].type);
            }

            if (matches.length > 0) {
                setMatchedReportsExist(true);
            }
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

    useEffect(() => {
        if (finalReport.length > 0) {
            setCanGenerateReport(true);
        } else {
            setCanGenerateReport(false);
        }
    }, [finalReport]);


    type UnmatchedReportCardProps = {
        vulnerability: any;
        isSelected: boolean;
        handleAdd: () => void;
        handleRemove: () => void;
        aiselected: boolean;
        listType: 'list1' | 'list2';
    };

    const UnmatchedReportCard = styled(Card, {
        shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'aiselected',
    })<{ selected: boolean; aiselected: boolean }>(
        ({ selected, aiselected }) => ({
            border: selected
                ? aiselected
                    ? '4px solid'
                    : '4px solid #4caf50'
                : 'none',
            animation: aiselected
                ? `${rainbowPulse} 3s infinite linear`
                : 'none',
            marginTop: '16px', // Adding spacing of 2 (16px)
        })
    );


    const MemoizedUnmatchedReportCard = memo(({ vulnerability, isSelected, handleAdd, handleRemove, aiselected }: UnmatchedReportCardProps) => (
        <UnmatchedReportCard selected={isSelected} aiselected={!!aiselected}>
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


    MemoizedUnmatchedReportCard.displayName = "MemoizedUnmatchedReportCard";

    const isUnmatchedReportSelected = useCallback((index: number, listType: 'list1' | 'list2') => {
        return selectedUnmatchedReports[listType].includes(index);
    }, [selectedUnmatchedReports]);



    const handleUnmatchedReport = (action: string, index: number, listType: 'list1' | 'list2', aiSelected = false) => {

        const updatedReportSet = new Set(finalReport);
        const updatedSelectedUnmatchedReports = { ...selectedUnmatchedReports };

        if (action === 'add') {
            updatedReportSet.add(listType === 'list1' ? unmatchedList1[index] : unmatchedList2[index]);
            updatedSelectedUnmatchedReports[listType].push(index);
        } else if (action === 'remove') {
            updatedReportSet.delete(listType === 'list1' ? unmatchedList1[index] : unmatchedList2[index]);
            updatedSelectedUnmatchedReports[listType] = updatedSelectedUnmatchedReports[listType].filter((i) => i !== index);
        }

        if (listType === 'list1') {
            setUnmatchedAiSelections1(prevUnmatchedAiSelections1 => {
                const updatedAiSelections = { ...prevUnmatchedAiSelections1 };
                updatedAiSelections[index] = aiSelected;
                return updatedAiSelections;
            });
        }

        if (listType === 'list2') {
            setUnmatchedAiSelections2(prevUnmatchedAiSelections2 => {
                const updatedAiSelections = { ...prevUnmatchedAiSelections2 };
                updatedAiSelections[index] = aiSelected;
                return updatedAiSelections;
            });
        }

        setFinalReport(Array.from(updatedReportSet));
        setSelectedUnmatchedReports(updatedSelectedUnmatchedReports);
    };


    const unmatchedReportsList1 = useMemo(() => (
        <>
            <Typography variant="h5" gutterBottom>{reportType1} Report </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                <Box display="flex" gap={2}>
                    <Button onClick={() => selectAllReports('unmatched1')}>Select All</Button>
                    <Button onClick={() => deselectAllReports('unmatched1')}>Deselect All</Button>
                </Box>
                {!matchedReportsExist && (
                    <Box position="relative" flexGrow={1} display="flex" justifyContent="center">
                        <Button
                            sx={{
                                position: 'relative',
                                left: '-6.5%',
                                width: '50px', // Set the fixed width
                                height: '60px', // Set the fixed height
                                display: 'flex', // Enable Flexbox
                                justifyContent: 'center', // Horizontally center content
                                alignItems: 'center', // Vertically center content
                                padding: 0,
                                overflow: 'hidden',

                            }}
                            variant="contained"
                            color={aiInsight ? "primary" : "secondary"}
                            onClick={aiToggle}
                        >
                            <Image src={AIImage} alt="AI" layout="fill" objectFit="cover" />
                        </Button>
                    </Box>
                )}
            </Box>
            {unmatchedList1.map((vulnerability, index) => (
                <MemoizedUnmatchedReportCard
                    key={index}
                    vulnerability={vulnerability}
                    isSelected={isUnmatchedReportSelected(index, 'list1')}
                    handleAdd={() => handleUnmatchedReport('add', index, 'list1')}
                    handleRemove={() => handleUnmatchedReport('remove', index, 'list1')}
                    aiselected={unmatchedAiSelections1[index]}
                    listType="list1"

                />
            ))}
        </>
    ), [unmatchedList1, isUnmatchedReportSelected, handleUnmatchedReport]);




    const unmatchedReportsList2 = useMemo(() => (
        <>
            <Typography variant="h5" gutterBottom>{reportType2} Report </Typography>

            <Button onClick={() => selectAllReports('unmatched2')}>Select All</Button>
            <Button onClick={() => deselectAllReports('unmatched2')}>Deselect All</Button>
            {unmatchedList2.map((vuln, index) => (
                <MemoizedUnmatchedReportCard
                    key={index}
                    vulnerability={vuln}
                    isSelected={isUnmatchedReportSelected(index, 'list2')}
                    handleAdd={() => handleUnmatchedReport('add', index, 'list2')}
                    handleRemove={() => handleUnmatchedReport('remove', index, 'list2')}
                    aiselected={unmatchedAiSelections2[index]}
                    listType="list2"
                />
            ))}
        </>
    ), [unmatchedList2, isUnmatchedReportSelected, handleUnmatchedReport]);

    const rainbowPulse = keyframes`
    0% { border-color: #53BF9D; } 
    25% { border-color: #F94C66; }  
    50% { border-color: #BD4291; }  
    75% { border-color: #FFC54D; }  
    100% { border-color: #53BF9D; }  
  `;

    const MemoizedReportCard = memo(({ report, isSelected, aiSelected }: { report: any; isSelected: boolean; aiSelected: boolean }) => (
        <ReportCard sx={{
            border: isSelected
                ? aiSelected
                    ? '4px solid'
                    : '4px solid #4caf50'
                : 'none',
            animation: aiSelected
                ? `${rainbowPulse} 3s infinite linear`
                : 'none',
        }}>
            <CardContent>
                {Object.entries(report).map(([key, value]) => (
                    <Typography key={key} variant="body2">
                        <strong>{key}:</strong> {value as React.ReactNode}
                    </Typography>
                ))}
            </CardContent>
        </ReportCard>
    ));

    MemoizedReportCard.displayName = "MemoizedReportCard";

    const renderReport = useMemo(() => {
        const render = (report: any, isSelected: boolean, index: number) => (
            <MemoizedReportCard report={report} isSelected={isSelected} aiSelected={aiSelections[index]} />
        );
        render.displayName = "renderReportFunction";
        return render;
    }, [aiSelections]);


    const handleButtonClick = (action: string, index: number, aiSelected = false) => {
        setFinalReport(prevFinalReport => {
            const updatedReportSet = new Set(prevFinalReport);

            if (action === 'acceptLeft') {
                updatedReportSet.add(matchedReports[index][0]);
            } else if (action === 'acceptRight') {
                updatedReportSet.add(matchedReports[index][1]);
            } else if (action === 'acceptBoth') {
                updatedReportSet.add(matchedReports[index][0]);
                updatedReportSet.add(matchedReports[index][1]);
            } else if (action === 'acceptNone') {
                updatedReportSet.delete(matchedReports[index][0]);
                updatedReportSet.delete(matchedReports[index][1]);
            }

            return Array.from(updatedReportSet);
        });

        setSelectedReports(prevSelectedReports => {
            const updatedSelectedReports = { ...prevSelectedReports };

            if (action === 'acceptLeft') {
                updatedSelectedReports.left.push(index);
            } else if (action === 'acceptRight') {
                updatedSelectedReports.right.push(index);
            } else if (action === 'acceptBoth') {
                updatedSelectedReports.left.push(index);
                updatedSelectedReports.right.push(index);
            } else if (action === 'acceptNone') {
                updatedSelectedReports.left = updatedSelectedReports.left.filter(i => i !== index);
                updatedSelectedReports.right = updatedSelectedReports.right.filter(i => i !== index);
            }

            return updatedSelectedReports;
        });

        // Update AI selection tracking
        setAiSelections(prevAiSelections => ({
            ...prevAiSelections,
            [index]: aiSelected,
        }));
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

                    {matchedReportsExist && (
                        <Box position="relative" flexGrow={1} display="flex" justifyContent="center">
                            <Button
                                sx={{
                                    position: 'relative',
                                    left: '8px',
                                    width: '50px', // Set the fixed width
                                    height: '60px', // Set the fixed height
                                    display: 'flex', // Enable Flexbox
                                    justifyContent: 'center', // Horizontally center content
                                    alignItems: 'center', // Vertically center content
                                    padding: 0,
                                    overflow: 'hidden',

                                }}
                                variant="contained"
                                color={aiInsight ? "primary" : "secondary"}
                                onClick={aiToggle}
                            >
                                <Image src={AIImage} alt="AI" layout="fill" objectFit="cover" />
                            </Button>
                        </Box>)}

                    <Box display="flex" gap={2} justifyContent="center">
                        <Button onClick={() => selectAllReports('matchedRight')}>Select All Right</Button>
                        <Button onClick={() => deselectAllReports('matchedRight')}>Deselect All Right</Button>
                    </Box>
                </Box>
                {matchedReports.map(([report1, report2], index) => (
                    <MatchedPair key={index}>
                        <Box display="flex" width="100%" justifyContent="space-between" alignItems="center">
                            {renderReport(report1, selectedReports.left.includes(index), index)}
                            <ButtonGroup>

                                {aiInsight && (

                                    <Tooltip title={matchedReportReccomendations[index]} arrow>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                        >
                                            A
                                            <InfoIcon />
                                        </Button>
                                    </Tooltip>
                                )}

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
                            {renderReport(report2, selectedReports.right.includes(index), index)}
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

        <ReportsContainer sx={mainContentStyles} id="reportsContainer">
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
                disabled={!canGenerteReport}
            >
                Save Final Report
            </Button>
            <Backdrop open={generatingReport} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }}>
                {success ? <Typography variant="h6">Generated Successfully!</Typography> : <Loader />}
            </Backdrop>
        </ReportsContainer>
    );
};

export default UserConflicts;
