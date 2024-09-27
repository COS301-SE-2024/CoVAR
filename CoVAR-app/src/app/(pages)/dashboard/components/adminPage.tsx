'use client';
import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Paper, Typography, Box, CircularProgress, Button } from '@mui/material';
import { fetchUsers, authorizeUser } from '@/functions/requests';
import ConfirmAuthorizeDialog from '../../adminTools/components/dialogs/confirmAuthorizeDialog'; 
import moment from 'moment';
import { dataGridStyles } from '@/styles/adminToolsStyle';
import { Height } from '@mui/icons-material';
import { mainContentStyles } from '@/styles/sidebarStyle';
import SeverityDistribution from './severityDistribution';
import { chartContainerStyles } from '@/styles/dashboardStyle';

type User = {
    user_id: string;
    username: string;
    role: string;
    created_at: string;
};

const AdminPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [userMetrics, setUserMetrics] = useState({
        total: 0,
        admins: 0,
        vas: 0,
        clients: 0
    });
    const [openDialog, setOpenDialog] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [alert, setAlert] = useState<{ visible: boolean; message: string; type?: 'success' | 'error' }>({
        visible: false,
        message: '',
        type: 'success',
    });

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const users: User[] = await fetchUsers(token as string);
                const oneWeekAgo = moment().subtract(7, 'days').startOf('day'); // Get the exact start of the day for one week ago
    
                // Filter unauthorized users created within the last week
                const unauthorizedUsers = users.filter((user: User) =>
                    user.role === 'unauthorised' && moment(user.created_at).isAfter(oneWeekAgo)
                );
    
                const metrics = {
                    total: users.length,
                    admins: users.filter((user: User) => user.role === 'admin').length,
                    vas: users.filter((user: User) => user.role === 'va').length,
                    clients: users.filter((user: User) => user.role === 'client').length
                };
    
                setUsers(unauthorizedUsers);
                setUserMetrics(metrics);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error('Error fetching users:', error);
            }
        };
    
        loadUsers();
    }, []);
    

    const handleAuthorizeDialogOpen = (username: string) => {
        setUsername(username);
        setOpenDialog(true);
    };

    const handleAuthorizeDialogClose = () => {
        setOpenDialog(false);
        setUsername(null);
    };

    const handleConfirmAuthorize = async () => {
        if (username) {
            await handleAuthorizeUser(username);
            handleAuthorizeDialogClose();
        }
    };

    const handleAuthorizeUser = async (username: string) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('Access token not found');
            }
            await authorizeUser(username, accessToken);
            setAlert({
                visible: true,
                message: `User ${username} authorized successfully!`,
                type: 'success',
            });

            const updatedUsers = await fetchUsers(accessToken);
            const oneWeekAgo = moment().subtract(7, 'days');

            const unauthorizedUsers = updatedUsers.filter((user: User) => 
                user.role === 'unauthorised' && moment(user.created_at).isAfter(oneWeekAgo)
            );

            setUsers(unauthorizedUsers);
        } catch (error) {
            console.error('Error authorizing user:', error);
            setAlert({
                visible: true,
                message: 'Error authorizing user',
                type: 'error',
            });
        }
    };

    const columns: GridColDef[] = [
        { field: 'username', headerName: 'Username', flex: 1 },
        { field: 'role', headerName: 'Role', flex: 1 },
        { field: 'created_at', headerName: 'Created At', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            renderCell: (params) => {
                if (params.row.role === 'unauthorised') {
                    return (
                        <Button
                            variant="contained"
                            sx={{
                                marginTop: '0.74vh', 
                                backgroundColor: '#5C4B8A',
                                color: '#CAD2C5', 
                                '&:hover': {
                                    backgroundColor: '#47356B',
                                },
                                borderRadius: '4px',
                                textAlign: 'center',
                                width: '6.25vw',
                                height: '3.38vh', 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onClick={() => handleAuthorizeDialogOpen(params.row.username)}
                        >
                            Authorize
                        </Button>
                    );
                }
                return null;
            },
        },
    ];

    const roleData = [
        { name: 'Admins', value: userMetrics.admins },
        { name: 'VAs', value: userMetrics.vas },
        { name: 'Clients', value: userMetrics.clients },
      ];

    return (

            <Box sx={mainContentStyles}>
                <Box sx = {{marginBottom : '2vh'}}>
                    <Typography variant="h5" color="text.primary">
                        User Metrics
                    </Typography>
                </Box>


                <Paper sx={{ padding: 2 }}>
                    <Typography>Total Users: {userMetrics.total}</Typography>
                    <Typography>Admins: {userMetrics.admins}</Typography>
                    <Typography>VAs: {userMetrics.vas}</Typography>
                    <Typography>Clients: {userMetrics.clients}</Typography>
                    <Paper sx={chartContainerStyles}>
                        <Typography variant="h6">Role Distribution</Typography>
                        <SeverityDistribution data={roleData} />
                    </Paper>
                </Paper>



                    <Box sx = {{marginBottom : '2vh', marginTop : '2vh'}}>
                        <Typography variant="h5" color="text.primary">
                            Unauthorised Users (Last Week)
                        </Typography>                    
                    </Box>



            {loading ? (
                <CircularProgress />
            ) : (

                    <DataGrid
                        rows={users}
                        columns={columns}
                        getRowId={(row) => row.user_id}
                        sx = {{...dataGridStyles, 
                            height : '50vh'
                        }}
                    />
            )}

            <ConfirmAuthorizeDialog
                open={openDialog}
                username={username}
                onClose={handleAuthorizeDialogClose}
                onConfirm={handleConfirmAuthorize}
            />
        </Box>
    );
};

export default AdminPage;
