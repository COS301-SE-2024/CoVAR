'use client'
import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { mainContentStyles } from '../../../styles/sidebarStyle';
import { uploadBoxStyles, uploadButtonStyles } from '../../../styles/evaluateStyle';

const Evaluate: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmitFile = () => {
    console.log('File submitted:', selectedFile);

  };

  return (
      <Box sx={mainContentStyles}>
        <Paper sx={uploadBoxStyles}>
          <Typography variant="h6">
            Upload a Vulnerability Assessment
          </Typography>
          <input
            type="file"
            accept=".pdf,.csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="contained" component="span" sx={uploadButtonStyles}>
              Upload File
            </Button>
          </label>
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
            </>
          )}
        </Paper>
      </Box>
  );
};

export default Evaluate;
