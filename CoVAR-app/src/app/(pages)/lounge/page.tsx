'use client'
import { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, CircularProgress, Card, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { loungeContainerStyles, loungeBoxStyles, brandTextStyles, iconStyles, loungeHeadingStyles, loungeTextStyles, signOutButtonStyles } from '../../../styles/loungeStyle';
import { useRouter } from 'next/navigation';
import { doSignOut } from '../../../functions/firebase/auth';
import axios from 'axios';

const Lounge: React.FC = () => {
    const router = useRouter();
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Clear the cookie on component mount
    // useEffect(() => {
    //     console.log("chicken");
    //     // Clear the accessToken cookie
    //     document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // }, []);

    const handleSignOut = async () => {
        try {
            await doSignOut();
            router.replace('/login');
        } catch (error) {
            console.error('signout error', error);
        }
    };

    // Function to get the current user and check their role
    const checkUserStatus = useCallback(async () => {
        console.log("getting UNAUTH");
        try {
            const response = await axios.post(
                '/api/UnauthgetUser',
                { accessToken: localStorage.getItem('accessToken') },
                { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
            );

            const { role } = response.data;
            console.log("Role:", role);

            if (role !== 'unauthorised') {
                console.log("NOT UNAUTH")
                router.replace('/dashboard'); 
            }

        } catch (error) {
            console.error('Error fetching user status:', error);
        }
    }, [router]);

    // Start polling every 5 seconds
    const startPolling = useCallback(() => {
        if (!pollingRef.current) {
            pollingRef.current = setInterval(() => {
                checkUserStatus(); 
            }, 5000); 
        }
    }, [checkUserStatus]);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    useEffect(() => {
        startPolling();

        return () => {
            stopPolling(); 
        };
    }, [startPolling, stopPolling]);

    return (
        <Box sx={loungeContainerStyles}>
            <Box sx={loungeBoxStyles}>
                <Card sx={{ backgroundColor: 'background.paper', padding: 4, borderRadius: 2, borderStyle: 'solid', borderWidth: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <br />
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
                    <br />
                    <br />
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                        <CircularProgress color="primary" />
                    </Box>
                    <br />
                    <br />
                    <br />
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
