'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { CircularProgress, Button, Typography, Menu, TextField, Autocomplete, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { authorizeUser } from '../../../../functions/requests';
import CheckIcon from '@mui/icons-material/Check';
import { 
    fetchUsers, 
    fetchOrganisations, 
    updateUserRole, 
    fetchAssignedClients, 
    fetchAssignedOrganisations, 
    assignClient, 
    unassignClient 
} from '../../../../functions/requests';
import { useRouter } from 'next/navigation';
import { buttonStyles, dataGridStyles, dialogStyles } from '@/styles/adminToolsStyle';
import ConfirmAuthorizeDialog from './dialogs/confirmAuthorizeDialog';
import AssignVADialog from './dialogs/assignVADialog';
import UnassignVADialog from './dialogs/unassignVADialog';
import AssignClientDialog from './dialogs/assignClientDialog';
import UnassignClientDialog from './dialogs/unassignClientDialog';

export type User = {
    user_id: string;
    username: string;
    role: string;
    organization: string | null;
};

type Organization = {
    organization_id: string;
    name: string;
    owner: string;
};

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [assignedClients, setAssignedClients] = useState<User[]>([]);
    const [assignedOrganizations, setAssignedOrganizations] = useState<Organization[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [alert, setAlert] = useState<{visible: boolean, message: string}>({visible: false, message: ''});
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    
// New states for confirmation dialog
const [openDialog, setOpenDialog] = useState(false);
const [username, setUsername] = useState<string | null>(null);
const [user_id, setUserID] = useState<string | null>(null);

// New states for assign/unassign dialogs
const [assignDialogOpen, setAssignDialogOpen] = useState(false);
const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
const [clientToAssign, setClientToAssign] = useState<string>('');
const [clientToUnassign, setClientToUnassign] = useState<string>('');

// New states for Assign VA and Unassign VA confirmation
const [assignVAOpen, setAssignVAOpen] = useState(false);
const [unassignVAOpen, setUnassignVAOpen] = useState(false);
const [userToAssignVA, setUserToAssignVA] = useState<User | null>(null);
const [userToUnassignVA, setUserToUnassignVA] = useState<User | null>(null);

const router = useRouter();

const redirectToLogin = useCallback(() => {
    router.replace('/login');
}, [router]);

useEffect(() => {
    const getToken = () => {
        setAccessToken(localStorage.getItem('accessToken'));
    };
    getToken();
}, []);

useEffect(() => {
    const loadUsers = async () => {
        try {
            if (!accessToken) {
                throw new Error('Access token not found');
            }
            const users = await fetchUsers(accessToken);
            setUsers(users);
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            if (error.response?.status === 403) {
                redirectToLogin();
            }
        }
    };

    loadUsers();
}, [accessToken, redirectToLogin]);

useEffect(() => {
    const loadOrganizations = async () => {
        try {
            if (!accessToken) {
                throw new Error('Access token not found');
            }
            const organizations = await fetchOrganisations(accessToken);
            setOrganizations(organizations);
        } catch (error: any) {
            if (error.response?.status === 403) {
                redirectToLogin();
            }
        }
    };

    loadOrganizations();
}, [accessToken, redirectToLogin]);



const handleUnassignDialogOpen = async (user_id: string) => {
    setUnassignDialogOpen(true);
    setUserID(user_id);
    try {
        if (!accessToken) {
            throw new Error('Access token not found');
        }
        const assignedClients = await fetchAssignedClients(user_id, accessToken);
        setAssignedClients(assignedClients);
        const assignedOrganizations = await fetchAssignedOrganisations(user_id, accessToken);
        setAssignedOrganizations(assignedOrganizations);
    } catch (error: any) {
        if (error.response?.status === 403) {
            redirectToLogin();
        }
    }
};

const handleAssignDialogOpen = async (user_id: string) => {
    setAssignDialogOpen(true);
    setUserID(user_id);
    setClientToAssign('');
};

const handleAssignDialogClose = () => {
    setAssignDialogOpen(false);
    setClientToAssign('');
};

const handleUnassignDialogClose = () => {
    setUnassignDialogOpen(false);
    setClientToUnassign(''); 
};

const handleAssignClient = async () => {
    if (user_id) {
        try {
            if (!accessToken) {
                throw new Error('Access token not found');
            }
            await assignClient(user_id, clientToAssign, accessToken);
            setAlert({
                visible: true,
                message: `Successfully assigned ${clientToAssign} to ${user_id}.`
            });
            setClientToAssign(''); // Reset input
            setAssignDialogOpen(false); // Close dialog
        } catch (error: any) {
            if (error.response?.status === 403) {
                redirectToLogin();
            }
        }
    }
};

const handleUnassignClient = async () => {
    if (user_id) {
        try {
            if (!accessToken) {
                throw new Error('Access token not found');
            }
            await unassignClient(user_id, clientToUnassign, accessToken);
            setAssignedClients(assignedClients.filter(client => client.username !== clientToUnassign));
            setAssignedOrganizations(assignedOrganizations.filter(org => org.name !== clientToUnassign));
            setAlert({
                visible: true,
                message: `Successfully unassigned ${clientToUnassign} from ${user_id}.`
            });
            setClientToUnassign(''); // Reset input
            setUnassignDialogOpen(false); // Close dialog
        } catch (error: any) {
            if (error.response?.status === 403) {
                redirectToLogin();
            }
        }
    }
};

const handleRoleToggle = async (user: User) => {
    if (!user) {
        console.error('User is null');
        return;
    }

    const newRole = user.role === 'va' ? 'client' : 'va';

    try {
        if (!accessToken) {
            throw new Error('Access token not found');
        }
        await updateUserRole(user.user_id, newRole, accessToken);
        setUsers(users.map(u => (u.user_id === user.user_id ? { ...u, role: newRole } : u)));
    } catch (error: any) {
        if (error.response?.status === 403) {
            redirectToLogin();
        }
    }
};

const handleAuthorizeDialogOpen = (username: string) => {
    setUsername(username);
    setOpenDialog(true);
};

const handleAuthorizeDialogClose = () => {
    setOpenDialog(false);
};

const handleConfirmAuthorize = async () => {
    if (username) {
        await handleAuthorizeUser(username);
        handleAuthorizeDialogClose();
    }
};

const handleAssignVADialogOpen = (user: User) => {
    setUserToAssignVA(user);
    setAssignVAOpen(true);
};

const handleAssignVADialogClose = () => {
    setAssignVAOpen(false);
};

const handleConfirmAssignVA = async () => {
    if (userToAssignVA) {
        await handleRoleToggle(userToAssignVA);
        handleAssignVADialogClose();
    }
};

const handleUnassignVADialogOpen = (user: User) => {
    setUserToUnassignVA(user);
    setUnassignVAOpen(true);
};


const handleUnassignVADialogClose = () => {
    setUnassignVAOpen(false);
};

const handleConfirmUnassignVA = async () => {
    if (userToUnassignVA) {
        await handleRoleToggle(userToUnassignVA);
        handleUnassignVADialogClose();
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
                message: `User ${username} authorised successfully!`,
            });
            const updatedUsers = await fetchUsers(accessToken);
            setUsers(updatedUsers);
        } catch (error) {
            console.error('Error authorising user:', error);
            setAlert({
                visible: true,
                message: 'Error authorising user',
            });
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) && user.role !== 'va'
    );

    const filteredOrganizations = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const assignOptions = [...filteredUsers.map(user => user.username), ...filteredOrganizations.map(org => org.name)];
    const unAssignOptions = [...assignedClients.map(client => client.username), ...assignedOrganizations.map(org => org.name)];

    const columns: GridColDef[] = [
        { field: 'username', headerName: 'Username', flex: 1, headerAlign: 'left', resizable: false },
        { field: 'role', headerName: 'Role', flex: 1, headerAlign: 'left', resizable: false },
        { field: 'organization', headerName: 'Organization', flex: 1, headerAlign: 'left', resizable: false },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 2,
            headerAlign: 'left',
            align: 'left',
            disableColumnMenu: true,
            renderCell: (params: GridRenderCellParams) => {
                if (params.row.role === 'admin') {
                    return (
                        <Typography
                            variant="body2"
                            sx={{
                                marginTop: '8px',
                                backgroundColor: '#52796F',
                                color: '#CAD2C5',
                                borderRadius: '4px',
                                textAlign: 'center',
                                width: '110px',
                                height: '36.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            ADMIN
                        </Typography>
                    );
                } else if (params.row.role === 'va') {
                    return (
                        <>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#EE1D52',
                                    color: '#CAD2C5',
                                    width: '110px',
                                    '&:hover': {
                                        backgroundColor: '#D11C45',
                                    },
                                }}
                                onClick={() => handleUnassignVADialogOpen(params.row)}
                                style={{ marginRight: '8px' }}
                            >
                                Unassign
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#84A98C',
                                    color: '#CAD2C5',
                                    width: '120px',
                                    '&:hover': {
                                        backgroundColor: '#749F82',
                                    },
                                    marginLeft: '0px',
                                }}
                                onClick={() => {
                                    setClientToAssign('');
                                    setUserID(null);
                                    setUsername(null);
                                    handleAssignDialogOpen(params.row.user_id)
                                }}
                            >
                                Assign Client
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#D96E15',
                                    color: '#CAD2C5',
                                    width: '150px',
                                    '&:hover': {
                                        backgroundColor: '#FF8C00',
                                    },
                                    marginLeft: '8px',
                                }}
                                onClick={() => {
                                    setClientToUnassign('');
                                    setUserID(null);
                                    setUsername(null);
                                    handleUnassignDialogOpen(params.row.user_id)
                                }}
                            >
                                Remove Client
                            </Button>
                        </>
                    );
                } else if (params.row.role === 'unauthorised') {
                    return (
                    <Button
                            variant="contained"
                            sx={{
                                marginTop: '8px',
                                backgroundColor: '#5C4B8A',
                                color: '#CAD2C5', 
                                '&:hover': {
                                    backgroundColor: '#47356B',
                                },
                                borderRadius: '4px',
                                textAlign: 'center',
                                width: '110px',
                                height: '36.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onClick={() => handleAuthorizeDialogOpen(params.row.username)}
                        >
                            Authorise
                        </Button>
                    );
                } else {
                    return (
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: '#84A98C',
                                color: '#CAD2C5',
                                width: '110px',
                                '&:hover': {
                                    backgroundColor: '#749F82',
                                },
                            }}
                            onClick={() => handleAssignVADialogOpen(params.row)}
                        >
                            Assign VA
                        </Button>
                    );
                }
            },
        },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div style={{ height: 600, width: '100%' }}>
            {alert.visible && (
            <Alert
                icon={<CheckIcon fontSize="inherit" />}
                severity="success"
                onClose={() => setAlert({visible: false, message: ''})}
            >
                {alert.message}
            </Alert>
            )}
            <DataGrid
                rows={users}
                columns={columns}
                getRowId={(row) => row.user_id}
                sx={dataGridStyles}
            />

            <ConfirmAuthorizeDialog
                open={openDialog}
                username={username}
                onClose={handleAuthorizeDialogClose}
                onConfirm={handleConfirmAuthorize}
            />
            <AssignVADialog
                open={assignVAOpen}
                user={userToAssignVA}
                onClose={handleAssignVADialogClose}
                onConfirm={handleConfirmAssignVA}
            />
            <UnassignVADialog
                open={unassignVAOpen}
                user={userToUnassignVA}
                onClose={handleUnassignVADialogClose}
                onConfirm={handleConfirmUnassignVA}
            />
            <AssignClientDialog
                open={assignDialogOpen}
                clientToAssign={clientToAssign}
                assignOptions={assignOptions}
                onClose={handleAssignDialogClose}
                onAssign={handleAssignClient}
                onClientChange={setClientToAssign}
            />
            <UnassignClientDialog
                open={unassignDialogOpen}
                clientToUnassign={clientToUnassign}
                unAssignOptions={unAssignOptions}
                onClose={handleUnassignDialogClose}
                onUnassign={handleUnassignClient}
                onClientChange={setClientToUnassign}
            />

        </div>
    );
};

export default UserList;
