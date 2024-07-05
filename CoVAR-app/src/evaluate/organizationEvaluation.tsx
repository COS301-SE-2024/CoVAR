import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, List, ListItem, ListItemText, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { mainContentStyles } from '../styles/sidebarStyle';
import FileUpload from './components/fileUpload';

interface FileUpload {
  upload_id: number;
  va: number;
  client: string | null;
  organization: string | null;
  type: string;
  created_at: string;
  loid: number;
  filename: string;
}

const OrganizationEvaluation: React.FC = () => {
  const { organizationName } = useParams<{ organizationName: string }>();
  const [uploads, setUploads] = useState<FileUpload[]>([]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const response = await axios.get(`/api/uploads/organization/${organizationName}`);
        setUploads(response.data);
      } catch (error) {
        console.error('Error fetching uploads:', error);
      }
    };

    fetchUploads();
  }, [organizationName]);

  const handleFileSubmit = async () => {
    // Refetch the uploads after a file is uploaded
    try {
      const response = await axios.get(`/api/uploads/organization/${organizationName}`);
      setUploads(response.data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const handleDownloadFile = async (loid: number, fileName: string) => {
    try {
      const response = await axios.get(`/api/uploads/file/${loid}`, {
        responseType: 'blob', // Important: responseType as blob to handle binary data
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ ...mainContentStyles, paddingTop: 8 }}>
      <Paper sx={{ padding: 4, textAlign: 'center' }}>
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
                  primary={`File Name: ${upload.filename}, Uploaded At: ${upload.created_at}`}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() =>
                    handleDownloadFile(upload.loid, `${upload.filename}`)
                  }
                >
                  Download
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrganizationEvaluation;