'use client'
import React from 'react';
import { Box, Typography, CircularProgress, Card, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { loungeContainerStyles, loungeBoxStyles, brandTextStyles, iconStyles, loungeHeadingStyles, loungeTextStyles, signOutButtonStyles } from '../../../styles/loungeStyle';
import { useRouter } from 'next/navigation';
import { doSignOut } from '../../../functions/firebase/auth';

const Lounge: React.FC = () => {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await doSignOut();
            router.replace('/login');
        } catch (error) {
            console.error('signout error', error);
        }
    };

    return (
        <Box sx={loungeContainerStyles}>
            <Box sx={loungeBoxStyles}>
                <Card sx={{ backgroundColor: 'background.paper', padding: 4, borderRadius: 2, borderStyle: 'solid', borderWidth: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <br></br>
                    <LockOutlinedIcon sx={iconStyles} />
                    <Typography variant="h1" sx={brandTextStyles}>
                        CoVAR
                    </Typography>
                    <Typography variant="h4" sx={loungeHeadingStyles}>
                        Welcome to the Lounge
                    </Typography>
                    <Typography variant="body1" sx={loungeTextStyles}>
                        Please wait here until an administrator verifies your account.
                    </Typography>
                    <br></br>
                    <br></br>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                        <CircularProgress color="primary" />
                    </Box>
                    <br></br>
                    <br></br>
                    <br></br>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ExitToAppIcon />}
                        sx={signOutButtonStyles}
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </Button>
                </Card>
            </Box>
        </Box>
    );
};

export default Lounge;
