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
            <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Typography>
                    Are you sure you want to assign <span style={{ color: 'text.secondary' }}>{user?.username}</span> as a Vulnerability Assessor?
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
