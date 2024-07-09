import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, List, ListItem, ListItemText, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import FileUpload from './components/fileUpload';
import { handleDownloadFile } from '../../../functions/requests';

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

const UserEvaluation: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [uploads, setUploads] = useState<FileUpload[]>([]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const response = await axios.get(`/api/uploads/client/${username}`);
        setUploads(response.data);
      } catch (error) {
        console.error('Error fetching uploads:', error);
      }
    };

    fetchUploads();
  }, [username]);

  const handleFileSubmit = async () => {
    // Refetch the uploads after a file is uploaded
    try {
      const response = await axios.get(`/api/uploads/client/${username}`);
      setUploads(response.data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };


  const handleRemoveFile = async (upload_id: number) => {
    try {
      await axios.delete(`/api/uploads/${upload_id}`);
      // Remove the deleted upload from the state
      setUploads(uploads.filter(upload => upload.upload_id !== upload_id));
    } catch (error) {
      console.error('Error removing upload:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ ...mainContentStyles, paddingTop: 8 }}>
      <Paper sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Evaluate User
        </Typography>
        {username && (
          <Typography variant="h6" gutterBottom>
            User: {username}
          </Typography>
        )}
        <FileUpload onFileSubmit={handleFileSubmit} client={username} />
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
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserEvaluation;