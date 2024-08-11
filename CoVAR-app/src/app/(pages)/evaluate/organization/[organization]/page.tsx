'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Container, List, ListItem, ListItemText, Button, Grid } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation'; 
import { mainContentStyles } from '../../../../../styles/evaluateStyle';
import FileUpload from '../../components/fileUpload';
import { handleDownloadFile } from '../../../../../functions/requests';
import ReportPreview from '../../components/reportPreview';
import { fetchUploadsOrganization, fetchReports, handleRemoveFile, handleToggleReport } from '../../../../../functions/requests';

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

const OrganizationEvaluation: React.FC = () => {
  const router = useRouter();
  const redirectToLogin = useCallback(() => {
    router.replace('/login');
  }, [router]);
  const pathname = usePathname();
  const organizationName = pathname.split('/').pop();

  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [reportIds, setReportIds] = useState<number[]>([]);
  const [reports, setReports] = useState<any[][]>([]);

  useEffect(() => {
    const fetchInitialUploads = async () => {
      try {
        if (organizationName) {
          const data = await fetchUploadsOrganization(organizationName);
          setUploads(data);
          const inReportIds = data.filter((upload: FileUpload) => upload.in_report).map((upload: FileUpload) => upload.upload_id);
          setReportIds(inReportIds);
        }
      } catch (error:any) {
        //console.error('Error fetching uploads:', error);
        if(error.response?.status === 403) {
          redirectToLogin();
        }
      }
    };
    fetchInitialUploads();
  }, [organizationName, redirectToLogin]);

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
      if (organizationName) {
        const data = await fetchUploadsOrganization(organizationName);
        setUploads(data);
        const inReportIds = data.filter((upload: FileUpload) => upload.in_report).map((upload: FileUpload) => upload.upload_id);
        setReportIds(inReportIds);
      }
    } catch (error:any) {
      //console.error('Error fetching uploads:', error);
      if(error.response?.status === 403) {
        redirectToLogin();
      }
    }
  };

  const handleRemove = async (upload_id: number) => {
    try {
      await handleRemoveFile(upload_id);
      setUploads(uploads.filter(upload => upload.upload_id !== upload_id));
      setReportIds(reportIds.filter(id => id !== upload_id));
    } catch (error:any) {
      //console.error('Error removing upload:', error);
      if(error.response?.status === 403) {
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
        setReportIds([...reportIds, upload_id]);
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  return (
    <Container maxWidth={false} sx={{ ...mainContentStyles, paddingTop: 8, width: '100vw' }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper sx={{ padding: 4, textAlign: 'center', overflowY: 'auto', maxHeight: '80vh' }}>
            <Typography variant="h4" gutterBottom>
              Evaluate Organization
            </Typography>
            {organizationName && (
              <Typography variant="h6" gutterBottom>
                Organization: {organizationName}
              </Typography>
            )}
            <FileUpload onFileSubmit={handleFileSubmit} organization={organizationName} />
            <Box mt={4}>
              <Typography variant="h6">Uploaded Files</Typography>
              <List>
                {uploads.map((upload) => (
                  <ListItem key={upload.upload_id}>
                    <ListItemText
                      primary={`File Name: ${upload.filename}, Uploaded At: ${new Date(upload.created_at).toLocaleString()}`}
                    />
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleDownloadFile(upload.loid, `${upload.filename}`)}
                      sx={{ marginRight: 2 }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleRemove(upload.upload_id)}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleToggle(upload.upload_id)}
                      sx={{ marginLeft: 2 }}
                    >
                      {reportIds.includes(upload.upload_id) ? 'Remove from Report' : 'Add to Report'}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ textAlign: 'center', overflowY: 'scroll', maxHeight: '80vh' }}>
            <ReportPreview reports={reports} reportIds={reportIds} client={organizationName ?? ''} />
          </Paper>
          <Button style={{
            left: '45%', marginTop: 5, position: 'relative'
          }} variant='outlined' color="primary" onClick={() => router.push(`/evaluate/conflicts/${organizationName}?type=org`)}>
            Next
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrganizationEvaluation;