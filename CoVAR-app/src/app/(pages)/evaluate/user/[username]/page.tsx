'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Container, List, ListItem, ListItemText, Button, Grid, Snackbar } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { usePathname } from 'next/navigation';
import { mainContentStyles, buttonStyles, boxStyles } from '../../../../../styles/evaluateStyle';
import FileUpload from '../../components/fileUpload';
import { handleDownloadFile } from '../../../../../functions/requests';
import ReportPreview from '../../components/reportPreview';
import { fetchUploadsClient, fetchReports, handleRemoveFile, handleToggleReport } from '../../../../../functions/requests';
import { useRouter } from 'next/navigation';
import { Loader } from '@/styles/conflictStyle';

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

const UserEvaluation: React.FC = () => {
  const router = useRouter();
  const redirectToLogin = useCallback(() => {
    router.replace('/login');
  }, [router]);

  const pathname = usePathname();
  const username = pathname.split('/').pop();

  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [reportIds, setReportIds] = useState<number[]>([]);
  const [reports, setReports] = useState<any[][]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [reportNames, setReportNames] = useState<string[]>([]);
  const [snackbarOpenInvalid, setSnackbarOpenInvalid] = useState(false);
  const [lastReportId, setLastReportId] = useState<number>(0);
  const [snackbarOpenMaxUpload, setSnackbarOpenMaxUpload] = useState(false);
  const [snackbarOpenNoAccess, setSnackbarOpenNoAccess] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const fetchInitialUploads = async () => {
      try {
        if (username) {
          try {
            const data = await fetchUploadsClient(username);
            setUploads(data);

            const inReportIds = data
              .filter((upload: FileUpload) => upload.in_report)
              .map((upload: FileUpload) => upload.upload_id);
            setReportIds(inReportIds);
          } catch (error: any) {
            // Handle specific API errors
            if (error.response) {
              const status = error.response.status;

              if (status === 401) {
                setSnackbarOpenNoAccess(true); // Unauthorized access
                setUnauthorized(true);
                console.error('Unauthorized: Please check your permissions.');
              } else if (status === 404) {
                setSnackbarOpenNoAccess(true); // Client not found
                setUnauthorized(true);
                console.error('Client not found.');
              } else {
                console.error('Error generating reports:', error);
              }
            } else {
              console.error('Network or server error:', error);
            }
          }
        }
      } catch (error: any) {

        if (error.response?.status === 403) {
          console.error('Forbidden: Redirecting to login.');
          redirectToLogin();
        } else {
          console.error('Unexpected error:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialUploads();
  }, [username, redirectToLogin]);


  useEffect(() => {

    const fetchInitialReports = async () => {
      try {
        if (reportIds.length > 0) {
          try {
            const fetchedReports = await fetchReports(reportIds);
            setReports(fetchedReports);
          } catch (error) {
            setSnackbarOpenInvalid(true);
            //make sure reportNames.length is not 0
            if (reportNames.length > 0) {
              handleRemove(lastReportId, reportNames[reportNames.length - 1]);
            } else {
              handleRemove(lastReportId, '');
            }
            console.error('Error generating reports:', error);
          }
        } else {
          setReports([]);
        }
      } catch (error) {
        setSnackbarOpenInvalid(true);

        console.error('Error generating reports:', error);
      }
    };
    fetchInitialReports();

  }, [reportIds]);



  const handleFileSubmit = async () => {

    if (uploads.length >= 6) {
      setSnackbarOpenMaxUpload(true);
      return;
    }

    try {
      if (username) {
        try {
          const data = await fetchUploadsClient(username);
          setUploads(data);
          const inReportIds = data.filter((upload: FileUpload) => upload.in_report).map((upload: FileUpload) => upload.upload_id);
          setReportIds(inReportIds);
        }
        catch (error) {
          setSnackbarOpenInvalid(true);
          console.error('Error generating reports:', error);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        redirectToLogin();
      }
    }


  };

  const handleRemove = async (upload_id: number, fileName: string) => {
    try {
      await handleRemoveFile(upload_id);
      setReportNames(reportNames.filter(name => name !== fileName));
      setUploads(uploads.filter(upload => upload.upload_id !== upload_id));
      setReportIds(reportIds.filter(id => id !== upload_id));
    } catch (error: any) {
      if (error.response?.status === 403) {
        redirectToLogin();
      }
    }
  };

  const handleToggle = async (upload_id: number, fileName: string) => {
    // Create local copies of the state for updates
    let updatedReportNames = [...reportNames];
    let updatedReportIds = [...reportIds];


    try {
      if (reportIds.includes(upload_id)) {
        // Attempt to remove the report
        try {
          await handleToggleReport(upload_id);
          // Remove from local copy
          updatedReportNames = updatedReportNames.filter(name => name !== fileName);
          updatedReportIds = updatedReportIds.filter(id => id !== upload_id);
        } catch (error) {
          setSnackbarOpenInvalid(true);
          console.error('Error updating report status:', error);
          return;
        }
      } else {

        if (reportIds.length < 2) {
          setLastReportId(upload_id);
          try {
            await handleToggleReport(upload_id);
            // Add to local copy
            updatedReportNames.push(fileName);
            updatedReportIds.push(upload_id);
          } catch (error) {
            setSnackbarOpenInvalid(true);
            console.error('Error updating report status:', error);
            return;
          }
        } else {
          setSnackbarOpen(true);
          return; // Exit early if limit reached
        }
      }
      setReportNames(updatedReportNames);
      setReportIds(updatedReportIds);
    } catch (error) {
      setSnackbarOpenInvalid(true);
      console.error('Error in handleToggle:', error);
    }
  };


  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCloseSnackbarInvalid = () => {
    setSnackbarOpenInvalid(false);
  };

  const handleCloseSnackbarMaxUpload = () => {
    setSnackbarOpenMaxUpload(false);
  }

  const handleCloseSnackbarNoAccess = () => {
    setSnackbarOpenNoAccess(false);
  }


  if (loading) {
    return (
      <Box
        sx={{
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
        }}
      >
        <Loader />
      </Box>
    );
  }

  if (unauthorized) {
    return (
      <Container maxWidth={false} sx={{ ...mainContentStyles, paddingTop: 8, width: '100vw' }}>
        <Box
          sx={{
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
          }}
        >
          <Typography variant="h4">Page does not exist</Typography>
        </Box>

      </Container>
    );
  }


  return (
    <Container maxWidth={false} sx={{ ...mainContentStyles, paddingTop: 8, width: '100vw' }}>
      <Snackbar
        sx={{
          width: '100%',
          position: 'absolute',
        }}
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={handleCloseSnackbar}
        message="Cannot add more than 2 reports"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />

      <Snackbar
        sx={{
          width: '100%',
          position: 'absolute',
        }}
        open={snackbarOpenNoAccess}
        autoHideDuration={1000}
        onClose={handleCloseSnackbarNoAccess}
        message="Client Not Found or Unauthorized Access"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />

      <Snackbar
        open={snackbarOpenMaxUpload}
        autoHideDuration={1000}
        onClose={handleCloseSnackbarMaxUpload}
        message="Cannot upload more than 6 files"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />

      <Snackbar
        sx={{
          width: '100%',
          position: 'absolute',
        }}
        open={snackbarOpenInvalid}
        autoHideDuration={1000}
        onClose={handleCloseSnackbarInvalid}
        message="Invalid Report Format, File Removed."
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper sx={{ padding: 4, textAlign: 'center', overflowY: 'auto', height: '40vh' }}>
            <Typography variant="h4" gutterBottom>
              Evaluate User
            </Typography>
            {username && (
              <Typography variant="h6" gutterBottom>
                User: {username}
              </Typography>
            )}
            <FileUpload onFileSubmit={handleFileSubmit} client={username ?? undefined} />
          </Paper>
          <Box mt={2} /> {/* Gap between the upload files and uploaded files */}
          <Paper sx={{ padding: 4, textAlign: 'center', overflowY: 'auto', height: '40vh' }}>
            <Typography variant="h6">Uploaded Files</Typography>
            <List>
              {uploads.map((upload) => (
                <ListItem key={upload.upload_id}>
                  <ListItemText
                    primary={`File Name: ${upload.filename}, Uploaded At: ${new Date(upload.created_at).toLocaleString()}`}
                  />
                  <Button
                    data-testid="delete-button"
                    variant="outlined"
                    sx={{
                      backgroundColor: 'transparent',
                      color: '#8B0000',
                      borderColor: '#8B0000',
                      '&:hover': {
                        borderColor: '#A52A2A',
                        color: '#A52A2A',
                      },
                      marginLeft: 1
                    }}
                    onClick={() => handleRemove(upload.upload_id, upload.filename)}
                  >
                    <DeleteIcon />
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleDownloadFile(upload.loid, `${upload.filename}`)}
                    sx={{ marginLeft: 1 }}
                  >
                    <DownloadIcon />
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleToggle(upload.upload_id, upload.filename)}
                    sx={{ marginLeft: 1 }}
                  >
                    {reportIds.includes(upload.upload_id) ? <RemoveIcon /> : <AddIcon />}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{
            overflowY: 'scroll',
            height: 'calc(80vh + 16px)',
            '&::-webkit-scrollbar': {
              width: '0.2vw',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'gray',
              borderRadius: '0.4vw',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'gray transparent',


          }}>

            <ReportPreview reports={reports} reportIds={reportIds} client={username ?? ''} reportNames={reportNames} />

          </Paper>
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          color="primary"
          disabled={reports.length === 0}
          onClick={() => router.push(`/evaluate/conflicts/${username}?type=client`)}
          sx={{
            ...buttonStyles,
            marginTop: '3vh',
            width: '150px',
            ...(reports.length === 0 && {
              backgroundColor: 'lightgrey',
              color: 'grey',
              borderColor: 'grey',
            }),
          }}
        >
          Next
        </Button>
      </Box>
    </Container>
  );
};

export default UserEvaluation;
