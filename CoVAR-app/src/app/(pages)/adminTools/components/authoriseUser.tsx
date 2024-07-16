import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Autocomplete, Popper, Box } from '@mui/material';
import { buttonStyles, cardStyles, textFieldStyles } from '../../../../styles/organisationStyle';
import { fetchUnauthorizedUsers, authorizeUser } from '../../../../functions/requests';

interface User {
    username: string;
}

const AuthoriseUser: React.FC = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [unauthorizedUsers, setUnauthorizedUsers] = useState<User[]>([]);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const initialFetch = async () => {
            const users = await fetchUnauthorizedUsers('');
            setUnauthorizedUsers(users);
        };
        initialFetch();
    }, []);

    const handleAuthorizeUser = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('Access token not found');
            }
            if (!username) {
                setMessage('No user selected');
                return;
            }

            await authorizeUser(username, accessToken);
            setMessage('User role updated to client successfully');
        } catch (error) {
            setMessage('Error authorising user');
        }
    };

    return (
        <Card sx={cardStyles}>
            <CardContent>
                <Typography variant="h6" color="text.primary">
                    Authorise User
                </Typography>
                <Autocomplete
                    freeSolo
                    options={unauthorizedUsers}
                    getOptionLabel={(option) => (option as User).username}
                    filterOptions={(options, state) => {
                        return options.filter((option) =>
                            (option as User).username.toLowerCase().includes(state.inputValue.toLowerCase())
                        );
                    }}
                    onInputChange={async (event, value) => {
                        const users = await fetchUnauthorizedUsers(value);
                        setUnauthorizedUsers(users);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            required
                            margin="normal"
                            fullWidth
                            id="user-username"
                            label="User Username"
                            name="user-username"
                            autoComplete="user-username"
                            InputLabelProps={{ sx: { color: 'text.primary' } }}
                            InputProps={{
                                ...params.InputProps,
                                sx: { color: 'text.primary' }
                            }}
                            sx={textFieldStyles}
                            onChange={(e) => setUsername(e.target.value)}
                            value={username || ''}
                        />
                    )}
                    onChange={(event, newValue) => {
                        if (typeof newValue === 'string') {
                            setUsername(newValue);
                        } else if (newValue && typeof newValue === 'object') {
                            setUsername((newValue as User).username);
                        } else {
                            setUsername('');
                        }
                    }}
                    PopperComponent={(props) => (
                        <Popper
                            {...props}
                            style={{
                                ...props.style,
                                zIndex: 1300,
                                maxHeight: 200,
                                overflowY: 'auto',
                            }}
                        />
                    )}
                />
                <Button
                    variant="contained"
                    sx={{ ...buttonStyles, mt: 3 }}
                    onClick={handleAuthorizeUser}
                >
                    Authorise User
                </Button>
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                    {message && (
                        <Typography 
                            variant="body2" 
                            color={message.startsWith('Error') ? 'error.main' : 'success.main'}
                            sx={{ 
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                                mb: 4  
                            }}
                        >
                            {message}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default AuthoriseUser;