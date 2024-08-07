import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete, TextField } from '@mui/material';
import { buttonStyles, dialogStyles } from '@/styles/adminToolsStyle';

interface AssignClientDialogProps {
    open: boolean;
    clientToAssign: string;
    assignOptions: string[];
    onClose: () => void;
    onAssign: (client: string) => void;
    onClientChange: (client: string) => void;
    onAssignClient: (client: string) => void;
}

const AssignClientDialog: React.FC<AssignClientDialogProps> = ({ open, clientToAssign, assignOptions, onClose, onAssign, onClientChange, onAssignClient }) => {
    return (
        <Dialog open={open} onClose={onClose} sx={dialogStyles}>
            <DialogTitle>Assign Client</DialogTitle>
            <DialogContent>
                <Autocomplete
                    freeSolo
                    disableClearable
                    options={assignOptions}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            required
                            margin="normal"
                            fullWidth
                            value={clientToAssign}
                            label="Search name/organisation"
                            InputLabelProps={{ sx: { color: 'text.primary' } }}
                            InputProps={{
                                ...params.InputProps,
                                type: 'search',
                                 sx: { color: 'text.primary' } }}
                            onChange={(e) => onClientChange(e.target.value)}
                        />
                    )}
                    onChange={(event, value) => {
                        if (value) {
                            onAssignClient(value as string);
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={buttonStyles}>Cancel</Button>
                <Button onClick={() => onAssign(clientToAssign)} sx={buttonStyles}>Assign</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignClientDialog;
