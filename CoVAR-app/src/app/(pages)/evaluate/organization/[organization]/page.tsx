'use client'
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, List, ListItem, ListItemText, Button } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation'; 
import axios from 'axios';
import { mainContentStyles } from '../../../../../styles/evaluateStyle';
import FileUpload from '../../components/fileUpload';
import { handleDownloadFile } from '../../../../../functions/requests';

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
  const router = useRouter();
  const redirectToLogin = () => {
    router.replace('/login');
  };
  const pathname = usePathname();
  const organizationName = pathname.split('/').pop(); 
  const [uploads, setUploads] = useState<FileUpload[]>([]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`/api/uploads/organization/${organizationName}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUploads(response.data);
      } catch (error:any) {
        //console.error('Error fetching uploads:', error);
        if(error.response?.status === 403) {
          redirectToLogin();
        }
      }
    };

    fetchUploads();
  }, [organizationName]);

  const handleFileSubmit = async () => {
    // Refetch the uploads after a file is uploaded
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/uploads/organization/${organizationName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUploads(response.data);
    } catch (error:any) {
      //console.error('Error fetching uploads:', error);
      if(error.response?.status === 403) {
        redirectToLogin();
      }
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
    } catch (error:any) {
      //console.error('Error removing upload:', error);
      if(error.response?.status === 403) {
        redirectToLogin();
      }
    }
  };

  return (
    <Container maxWidth={false}  sx={{ ...mainContentStyles, paddingTop: 8, width: '100vw' }}>
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
                  primary={`File Name: ${upload.filename}, Uploaded At: ${new Date(upload.created_at).toLocaleString()}`}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() =>
                    handleDownloadFile(upload.loid, `${upload.filename}`)
                  }
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
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrganizationEvaluation;