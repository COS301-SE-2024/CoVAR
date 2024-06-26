import React, { useEffect, useState } from 'react';
import { CircularProgress, Button, Typography, Menu, TextField, Autocomplete, Alert } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';

type User = {
    user_id: string;
    username: string;
    role: string;
    organization: string | null; // Allow null for users without an organization
};

type Organization = {
    organization_id: string;
    name: string;
    owner: string;
};


const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);

    if (!Array.isArray(users)) {
        setUsers([]);
    }
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [assignedClients, setAssignedClients] = useState<User[]>([]);
    const [assignedOrganizations, setAssignedOrganizations] = useState<Organization[]>([]);
    const [unassignAnchorEl, setUnassignAnchorEl] = useState<null | HTMLElement>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [alert, setAlert] = useState<{visible: boolean, message: string}>({visible: false, message: ''});


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/users/all');
                setUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await axios.get('/api/organizations/all');
                setOrganizations(response.data);
            } catch (error) {
                console.error('Error fetching organizations:', error);
            }
        };

        fetchOrganizations();
    }, []);

    const handleRoleToggle = async (user: User) => {
        if (!user) {
            console.error('User is null');
            return;
        }

        const newRole = user.role === 'VA' ? 'client' : 'VA';
        console.log('Updating user role:', user.user_id, user.role, '->', newRole);

        try {
            await axios.patch(`/api/users/${user.user_id}/role`, { role: newRole });
            setUsers(users.map(u => (u.user_id === user.user_id ? { ...u, role: newRole } : u)));
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, user: User) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleUnassignMenuOpen = async (event: React.MouseEvent<HTMLButtonElement>, user: User) => {
        setUnassignAnchorEl(event.currentTarget);
        setSelectedUser(user);
        try {
            const assignedClients = await axios.get(`/api/users/${user.user_id}/assigned_clients`);
            setAssignedClients(assignedClients.data);
            const assignedOrganizations = await axios.get(`/api/users/${user.user_id}/assigned_organizations`);
            setAssignedOrganizations(assignedOrganizations.data);
            
            


            // console.log('Assigned clients:', assignedClients.data);
            // console.log('Assigned organizations:', assignedOrganizations.data);

        } catch (error) {
            console.error('Error fetching assigned clients:', error);
        }
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
        setSearchTerm('');
    };

    const handleUnassignMenuClose = () => {
        setUnassignAnchorEl(null);
        setSelectedUser(null);
    };

    const handleAssignClient = async (clientUsername: string) => {
        if (selectedUser) {
            try {
                await axios.post(`/api/users/${selectedUser.user_id}/assign`, { clientUsername });
                handleMenuClose();

                setAlert({
                    visible: true,
                    message: `Successfully assigned ${clientUsername} to ${selectedUser.username}.`
                });
            } catch (error) {
                console.error('Error assigning client:', error);
            }
        }
    };

    const handleUnassignClient = async (clientUsername: string) => {
        if (selectedUser) {
            try {
                await axios.post(`/api/users/${selectedUser.user_id}/unassign`, { clientUsername });
                setAssignedClients(assignedClients.filter(client => client.username !== clientUsername));
                setAssignedOrganizations(assignedOrganizations.filter(org => org.name !== clientUsername));
                handleUnassignMenuClose();

                setAlert({
                    visible: true,
                    message: `Successfully unassigned ${clientUsername} from ${selectedUser.username}.`
                });
    
                
            } catch (error) {
                console.error('Error unassigning client:', error);
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) && user.role !== 'VA'
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
                } else if (params.row.role === 'VA') {
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
                                onClick={() => handleRoleToggle(params.row)}
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
                                onClick={(event) => handleMenuOpen(event, params.row)}
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
                                onClick={(event) => handleUnassignMenuOpen(event, params.row)}
                            >
                                Un-Assign Client
                            </Button>
                        </>
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
                            onClick={() => handleRoleToggle(params.row)}
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
                sx={{
                    height: 600,
                    flex: '1 auto',
                    fontWeight: 500,
                    borderColor: 'text.primary', 
                    '& .MuiDataGrid-columnHeaderTitle': {
                        color: 'text.primary',
                    },
                    '& .MuiDataGrid-columnSeparator': {
                        color: 'text.primary',
                    },
                    '& .MuiDataGrid-cell': {
                        color: 'text.primary',
                        borderColor: 'text.primary', 
                    },
                    '& .MuiDataGrid-footerContainer': {
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                    },
                    '& .MuiTablePagination-root': {
                        color: 'text.primary',
                    },
                    '& .MuiSvgIcon-root': {
                        color: 'text.primary',
                    },
                    '& .MuiDataGrid-toolbarContainer button': {
                        color: 'text.primary',
                    },
                    '& .MuiDataGrid-topContainer, & .MuiDataGrid-container--top': {
                        backgroundColor: 'primary.main',
                    },
                    '& .MuiDataGrid-overlay': {
                        backgroundColor: 'background.default',
                        color: 'text.primary',
                    },
                    '& .MuiDataGrid-filler': {
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                    },
                    '& .MuiDataGrid-scrollbarFiller': {
                        backgroundColor: 'background.paper',
                    },
                    '& .MuiDataGrid-scrollbarFiller--header': {
                        backgroundColor: 'background.paper', 
                    },
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                    },
            }}
            />
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <Autocomplete
                    freeSolo
                    disableClearable
                    options={assignOptions}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search name/organization"
                            InputProps={{
                                ...params.InputProps,
                                type: 'search',
                            }}
                            sx={{ margin: '4px', width: '200px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    )}
                    onChange={(event, value) => handleAssignClient(value as string)}
                />
            </Menu>
            <Menu
                anchorEl={unassignAnchorEl}
                open={Boolean(unassignAnchorEl)}
                onClose={handleUnassignMenuClose}
            >
                <Autocomplete
                    freeSolo
                    disableClearable
                    options={unAssignOptions}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Assigned Clients"
                            InputProps={{
                                ...params.InputProps,
                                type: 'search',
                            }}
                            sx={{ margin: '4px', width: '200px' }}
                        />
                    )}
                    onChange={(event, value) => handleUnassignClient(value as string)}
                />
            </Menu>
        </div>
    );
};

export default UserList;