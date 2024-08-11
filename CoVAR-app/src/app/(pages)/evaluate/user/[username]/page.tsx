'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Container, List, ListItem, ListItemText, Button, Grid, Snackbar } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { usePathname } from 'next/navigation';
import { mainContentStyles, buttonStyles } from '../../../../../styles/evaluateStyle';
import FileUpload from '../../components/fileUpload';
import { handleDownloadFile } from '../../../../../functions/requests';
import ReportPreview from '../../components/reportPreview';
import { fetchUploadsClient, fetchReports, handleRemoveFile, handleToggleReport } from '../../../../../functions/requests';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    const fetchInitialUploads = async () => {
      try {
        if (username) {
          const data = await fetchUploadsClient(username);
          setUploads(data);
          const inReportIds = data.filter((upload: FileUpload) => upload.in_report).map((upload: FileUpload) => upload.upload_id);
          setReportIds(inReportIds);
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          redirectToLogin();
        }
      }
    };
    fetchInitialUploads();
  }, [username, redirectToLogin]);

  useEffect(() => {
    const fetchInitialReports = async () => {
      try {
        if (reportIds.length > 0) {
          const fetchedReports = await fetchReports(reportIds);
          setReports(fetchedReports);
        } else {
          setReports([]);
        }
      } catch (error) {
        console.error('Error generating reports:', error);
      }
    };
    fetchInitialReports();
  }, [reportIds]);

  const handleFileSubmit = async () => {
    try {
      if (username) {
        const data = await fetchUploadsClient(username);
        setUploads(data);
        const inReportIds = data.filter((upload: FileUpload) => upload.in_report).map((upload: FileUpload) => upload.upload_id);
        setReportIds(inReportIds);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        redirectToLogin();
      }
    }
  };

  const handleRemove = async (upload_id: number) => {
    try {
      await handleRemoveFile(upload_id);
      setUploads(uploads.filter(upload => upload.upload_id !== upload_id));
      setReportIds(reportIds.filter(id => id !== upload_id));
    } catch (error: any) {
      if (error.response?.status === 403) {
        redirectToLogin();
      }
    }
  };

  const handleToggle = async (upload_id: number) => {
    try {
      await handleToggleReport(upload_id);
      if (reportIds.includes(upload_id)) {
        setReportIds(reportIds.filter(id => id !== upload_id));
      } else {
        if (reportIds.length < 2) {
          setReportIds([...reportIds, upload_id]);
        } else {
          setSnackbarOpen(true);
        }
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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
        message="Cannot add more than 2 report IDs"
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
                    onClick={() => handleRemove(upload.upload_id)}
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
                    onClick={() => handleToggle(upload.upload_id)}
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
          <Paper sx={{ textAlign: 'center', overflowY: 'scroll', height: 'calc(80vh + 16px)' }}>
            {reports.length === 0 ? (
              <Typography variant="h6" style={{ textAlign: 'center', padding: '20px' }}>
                No reports to display
              </Typography>
            ) : (
              <ReportPreview reports={reports} reportIds={reportIds} client={username ?? ''} />
            )}
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
