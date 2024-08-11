import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { buttonStyles, dialogStyles } from '@/styles/adminToolsStyle';
import { User } from '../userList';

interface AssignVADialogProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onConfirm: () => void;
}

const AssignVADialog: React.FC<AssignVADialogProps> = ({ open, user, onClose, onConfirm }) => {
    return (
        <Dialog open={open} onClose={onClose} sx={dialogStyles}>
            <DialogTitle>Assign Vulnerability Assessor</DialogTitle>
            <DialogContent sx={{ padding: '0 24px',  display: 'flex', justifyContent: 'center', flexDirection: 'column', color: 'text.primary' }}>
                <Typography>
                    Are you sure you want to assign {user?.username} as a Vulnerability Assessor?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={buttonStyles}>Cancel</Button>
                <Button onClick={onConfirm} sx={buttonStyles}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignVADialog;
