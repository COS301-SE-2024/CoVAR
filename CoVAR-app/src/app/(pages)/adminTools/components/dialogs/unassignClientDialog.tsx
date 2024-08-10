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

const UnassignClientDialog: React.FC<UnassignClientDialogProps> = ({
    open,
    clientToUnassign,
    unAssignOptions,
    onClose,
    onUnassign,
    onClientChange,
}) => {
    const isClientValid = unAssignOptions.includes(clientToUnassign);

    return (
        <Dialog open={open} onClose={onClose} sx={dialogStyles}>
            <DialogTitle>Unassign Client</DialogTitle>
            <DialogContent sx={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Autocomplete
                    freeSolo
                    disableClearable
                    options={unAssignOptions}
                    sx={{ width: '100%' }}
                    noOptionsText="No Assigned Clients"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Client Username"
                            InputLabelProps={{ sx: { color: 'text.primary' } }}
                            InputProps={{
                                ...params.InputProps,
                                type: 'search',
                                sx: { color: 'text.primary' },
                            }}
                            value={clientToUnassign}
                            onChange={(e) => onClientChange(e.target.value)}
                            required
                            margin="normal"
                            fullWidth
                        />
                    )}
                    onChange={(event, value) => {
                        onClientChange(value as string);
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={buttonStyles}>Cancel</Button>
                <Button
                    onClick={() => onUnassign(clientToUnassign)}
                    sx={{
                        ...buttonStyles,
                        ...(isClientValid ? {} : {
                            backgroundColor: 'grey',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'grey',
                            }
                        }),
                    }}
                    disabled={!isClientValid}
                >
                    Unassign
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UnassignClientDialog;
