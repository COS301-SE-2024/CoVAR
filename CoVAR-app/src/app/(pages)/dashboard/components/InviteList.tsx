'use client';
import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { fetchAllInvites } from '@/functions/requests';

type Invite = {
    invite_id: string;
    username: string;
    organization_name: string;
    invite_status: string;
};

const InviteList: React.FC = () => {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInvites = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const allInvites = await fetchAllInvites(token as string);
                const pendingInvites = allInvites.filter((invite: Invite) => invite.invite_status === 'pending'); // Filter pending invites
                setInvites(pendingInvites);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching invites:', error);
                setLoading(false);
            }
        };

        loadInvites();
    }, []);

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h6" color="text.primary">Pending Invites</Typography>
            {loading ? (
                <CircularProgress />
            ) : invites.length === 0 ? (
                <Typography>No pending invites at the moment.</Typography>
            ) : (
                <List
                    sx={{
                        maxHeight: '300px', // Adjust maxHeight as needed
                        overflowY: 'auto',   // Enable vertical scroll when needed
                        '&::-webkit-scrollbar': {
                            width: '0.2vw', 
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'gray', 
                            borderRadius: '0.4vw',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: 'transparent', 
                        },
                        scrollbarWidth: 'thin', 
                        scrollbarColor: 'gray transparent', 
                    }}
                >
                    {invites.map((invite) => (
                        <ListItem key={invite.invite_id}>
                            <ListItemText
                                primary={`${invite.username} - ${invite.organization_name}`}
                                secondary={`Status: ${invite.invite_status}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default InviteList;
