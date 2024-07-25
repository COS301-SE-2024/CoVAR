'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, List, ListItem, ListItemText, Button, Grid } from '@mui/material';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { mainContentStyles } from '../../../../../styles/evaluateStyle';
import FileUpload from '../../components/fileUpload';
import { handleDownloadFile } from '../../../../../functions/requests';
import ReportPreview from '../../components/reportPreview'; 

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
  const pathname = usePathname();
  const username = pathname.split('/').pop();
  

  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [reportIds, setReportIds] = useState<number[]>([]); //ReporIds is a list of the ids of the reports that are in the report
  const [reports, setReports] = useState<any[][]>([]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`/api/uploads/client/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUploads(response.data);
        const inReportIds = response.data.filter((upload: FileUpload) => upload.in_report).map((upload: FileUpload) => upload.upload_id);
        setReportIds(inReportIds);
      } catch (error) {
        console.error('Error fetching uploads:', error);
      }
    };

    if (username) {
      fetchUploads();
    }
  }, [username]);


  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const fetchedReports = await Promise.all(
          reportIds.map(async (id) => {
            const response = await axios.get(`/api/uploads/generateSingleReport/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            return response.data;
          })
        );
        setReports(fetchedReports);
        console.log(fetchedReports);
      } catch (error) {
        console.error('Error generating reports:', error);
      }
    };

    if (reportIds.length > 0) {
      fetchReports();
    } else {
      setReports([]);
    }
    
  }, [reportIds]);

  const handleFileSubmit = async () => {
    // Refetch the uploads after a file is uploaded
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/uploads/client/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUploads(response.data);
      const inReportIds = response.data.filter((upload: FileUpload) => upload.in_report).map((upload: FileUpload) => upload.upload_id);
      setReportIds(inReportIds);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const handleRemoveFile = async (upload_id: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/api/uploads/${upload_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove the deleted upload from the state
      setUploads(uploads.filter(upload => upload.upload_id !== upload_id));
      setReportIds(reportIds.filter(id => id !== upload_id));
      // setReports(reports.filter(report => report[0].upload_id !== upload_id));

    } catch (error) {
      console.error('Error removing upload:', error);
    }
  };

  const handleToggleReport = async (upload_id: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      
      await axios.put(`/api/uploads/inReport/${upload_id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
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
              Evaluate User
            </Typography>
            {username && (
              <Typography variant="h6" gutterBottom>
                User: {username}
              </Typography>
            )}
            <FileUpload onFileSubmit={handleFileSubmit} client={username ?? undefined} />
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
                      onClick={() => handleRemoveFile(upload.upload_id)}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleToggleReport(upload.upload_id)}
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
            <ReportPreview reports={reports} reportIds={reportIds} client={username ?? ''} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserEvaluation;