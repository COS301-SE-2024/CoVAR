import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { buttonStyles, dialogStyles } from '@/styles/adminToolsStyle';

interface ConfirmAuthorizeDialogProps {
    open: boolean;
    username: string | null;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmAuthorizeDialog: React.FC<ConfirmAuthorizeDialogProps> = ({ open, username, onClose, onConfirm }) => {
    return (
        <Dialog open={open} onClose={onClose} sx={dialogStyles}>
            <DialogTitle>Confirm Authorisation</DialogTitle>
            <DialogContent sx={{ padding: '0 24px',  display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Typography>
                    Are you sure you want to Authorise the user {username}?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={buttonStyles}>Cancel</Button>
                <Button onClick={onConfirm} sx={buttonStyles}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmAuthorizeDialog;
