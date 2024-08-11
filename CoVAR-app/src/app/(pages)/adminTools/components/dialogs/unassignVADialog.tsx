import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { buttonStyles, dialogStyles } from '@/styles/adminToolsStyle';
import { User } from '../userList'; // Adjust the import based on your structure

interface UnassignVADialogProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onConfirm: () => void;
}

const UnassignVADialog: React.FC<UnassignVADialogProps> = ({ open, user, onClose, onConfirm }) => {
    return (
        <Dialog open={open} onClose={onClose} sx={dialogStyles}>
            <DialogTitle>Unassign Vulnerability Assessor</DialogTitle>
            <DialogContent sx={{ padding: '0 24px',  display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Typography>
                    Are you sure you want to unassign {user?.username} as a Vulnerability Assessor?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={buttonStyles}>Cancel</Button>
                <Button onClick={onConfirm} sx={buttonStyles}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UnassignVADialog;
