import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import Sidebar from '../sidebar/sidebar';
import { mainContentStyles } from '../styles/sidebarStyle';
import { dashboardContainerStyles } from '../styles/dashboardStyle';
import { evaluateContainerStyles, uploadBoxStyles, uploadButtonStyles } from '../styles/evaluateStyle';

const Evaluate: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmitFile = () => {
    // Handle file submit
    console.log('File submitted:', selectedFile);

  };

  return (
    <Box sx={evaluateContainerStyles}>
      <Sidebar />
      <Box sx={mainContentStyles}>
        <Paper sx={uploadBoxStyles}>
          <Typography variant="h6" sx={{ color: '#CAD2C5', marginBottom: 2 }}>
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
              <Typography sx={{ marginTop: 1, color: '#CAD2C5' }} variant="body2">
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
    </Box>
  );
};

export default Evaluate;
