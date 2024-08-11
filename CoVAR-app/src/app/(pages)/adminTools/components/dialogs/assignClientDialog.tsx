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
}

const AssignClientDialog: React.FC<AssignClientDialogProps> = ({
    open,
    clientToAssign,
    assignOptions,
    onClose,
    onAssign,
    onClientChange,
}) => {
    const isClientValid = assignOptions.includes(clientToAssign);

    return (
        <Dialog open={open} onClose={onClose} sx={dialogStyles}>
            <DialogTitle>Assign Client</DialogTitle>
            <DialogContent sx={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Autocomplete
                    freeSolo
                    disableClearable
                    options={assignOptions}
                    sx={{ width: '100%' }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            required
                            margin="normal"
                            fullWidth 
                            label="Search name/organisation"
                            InputLabelProps={{ sx: { color: 'text.primary' } }}
                            InputProps={{
                                ...params.InputProps,
                                type: 'search',
                                sx: { color: 'text.primary'}, 
                            }}
                            value={clientToAssign}
                            onChange={(e) => onClientChange(e.target.value)}
                        />
                    )}
                    onChange={(event, value) => {
                        console.log('Selected value:', value);
                        if (value) {
                            onClientChange(value as string);
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={buttonStyles}>Cancel</Button>
                <Button
                    onClick={() => onAssign(clientToAssign)}
                    sx={{
                        ...buttonStyles,
                        ...(isClientValid ? {} : {
                            backgroundColor: 'grey',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'grey',
                            },
                        }),
                    }}
                    disabled={!isClientValid}
                >
                    Assign
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default AssignClientDialog;
