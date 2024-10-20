import React, { useState } from 'react';
import { Button, Typography, Paper } from '@mui/material';
import axios from 'axios';
import { uploadBoxStyles, uploadButtonStyles } from '../../../../styles/evaluateStyle';

interface FileUploadProps {
  onFileSubmit: () => void;
  client?: string;
  organization?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSubmit, client, organization }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cooldown, setCooldown] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmitFile = async () => {
    setCooldown(true);
    setTimeout(() => setCooldown(false), 5000);
    if (!selectedFile) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      const base64File = reader.result?.toString().split(',')[1]; // Extract base64 content
      if (base64File) {
        const token = localStorage.getItem('accessToken');
        try {
          await axios.post('/api/uploads', {
            clientName: client,
            organizationName: organization,
            type: selectedFile.type,
            fileContent: base64File,
            filename: selectedFile.name,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          onFileSubmit();
          setSelectedFile(null); // Reset file after successful upload
        } catch (err) {
          console.error('Error uploading file:', err);
        }
      } else {
        console.error('Base64 content is undefined');
      }
    };
  };

  const handleCancelUpload = () => {
    setSelectedFile(null); // Reset selected file
  };

  //If disabled true then return loading spinner
  if (cooldown) {
    return (
      <Paper sx={uploadBoxStyles}>
        <Typography variant="h6">
          Uploading...
        </Typography>
      </Paper>
    );
  }


  return (
    <Paper sx={uploadBoxStyles}>

      {!selectedFile && (
        <>
          <Typography variant="h6">
            Upload a Vulnerability Assessment
          </Typography>
          <input
            type="file"
            accept=".pdf,.csv,.xml,.nessus"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="contained" component="span" sx={uploadButtonStyles}>
              Upload File
            </Button>
          </label>
        </>
      )}
      {selectedFile && (
        <>
          <Typography variant="body2">
            Selected File: {selectedFile.name}
          </Typography>
          <Button
            variant="contained"
            sx={{ ...uploadButtonStyles, marginTop: 2 }}
            onClick={handleSubmitFile}

          >
            Submit File
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancelUpload}
            sx={{ marginTop: 2 }}
          >
            Cancel Upload
          </Button>
        </>
      )}
    </Paper>
  );
};

export default FileUpload;
