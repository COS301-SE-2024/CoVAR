// HelpDialog.tsx
'use client'
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { usePathname } from 'next/navigation'; 

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

type HelpContent = {
  [key: string]: React.JSX.Element;
};

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => {
  const pathname = usePathname(); 

  const helpContent: HelpContent = {
    '/dashboard': (
      <>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          The Dashboard page displays various charts and lists to provide an overview of important data.
        </Typography>
      </>
    ),
    '/evaluate': (
      <>
        <Typography variant="h4" gutterBottom>
          Evaluate
        </Typography>
        <Typography variant="body1" paragraph>
          The Evaluate page allows users to upload a vulnerability assessment in PDF or CSV format.
          Users can select a file from their local machine, view the selected file name, and submit the file for evaluation.
        </Typography>
      </>
    ),
    '/organisation': (
      <>
        <Typography variant="h4" gutterBottom>
          Organisation
        </Typography>
        <Typography variant="body1" paragraph>
          The Organisation page allows users to manage their organisation, including adding and removing members,
          changing the organisation name, and disbanding the organisation.
        </Typography>
      </>
    ),
    '/adminTools': (
      <>
        <Typography variant="h4" gutterBottom>
          Admin Tools
        </Typography>
        <Typography variant="body1" paragraph>
          The Admin Tools page provides functionalities for managing users and their roles within the system.
          Admins can view a list of users, authorise new users, assign or unassign vulnerability assessors and their clients, as well as search for users.
        </Typography>
      </>
    ),
  };

  return (
    <Dialog open={open} onClose={onClose}>

    <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {helpContent[pathname] || (
          <Typography variant="body1">No help information available for this page.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpDialog;
