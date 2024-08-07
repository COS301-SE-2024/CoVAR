import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete, TextField } from '@mui/material';
import { buttonStyles, dialogStyles } from '@/styles/adminToolsStyle';

interface UnassignClientDialogProps {
    open: boolean;
    clientToUnassign: string;
    unAssignOptions: string[];
    onClose: () => void;
    onUnassign: (client: string) => void;
    onClientChange: (client: string) => void;
}

const UnassignClientDialog: React.FC<UnassignClientDialogProps> = ({ open, clientToUnassign, unAssignOptions, onClose, onUnassign, onClientChange }) => {
    return (
        <Dialog open={open} onClose={onClose} sx={dialogStyles}>
            <DialogTitle>Unassign Client</DialogTitle>
            <DialogContent>
                <Autocomplete
                    freeSolo
                    disableClearable
                    options={unAssignOptions}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Client Username"
                            InputLabelProps={{ sx: { color: 'text.primary' } }}
                            InputProps={{ sx: { color: 'text.primary' } }}
                            value={clientToUnassign}
                            onChange={(e) => onClientChange(e.target.value)}
                            required
                            margin="normal"
                            fullWidth
                        />
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={buttonStyles}>Cancel</Button>
                <Button onClick={() => onUnassign(clientToUnassign)} sx={buttonStyles}>Unassign</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UnassignClientDialog;
