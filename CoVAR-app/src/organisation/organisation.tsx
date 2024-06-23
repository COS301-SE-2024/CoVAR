import { Button, Card, CardContent, CircularProgress, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { getUserRole, fetchUsers, removeUser, addUser, deleteOrganisation, createOrganisation, changeOrganisationName } from '../requests/requests';
import { buttonStyles, cardStyles, headingBoxStyles, mainContentStyles, textFieldStyles } from '../styles/organisationStyle';

type User = {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt?: string;
};

const Organisation = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [organisationName, setOrganisationName] = useState('');
    const [confirmOrganisationName, setConfirmOrganisationName] = useState('');
    const [deleteConfirmed, setDeleteConfirmed] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isInOrg, setIsInOrg] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (accessToken) {
                    const userData = await getUserRole(accessToken);
                    console.log("User data:", userData);
                    setRole(userData.role);
                    setIsOwner(userData.isOwner);
                    setIsInOrg(userData.organization_id);
                    setIsInOrg(userData.organization_id);
                    setUsername(userData.username);
                    console.log("User role:", userData.role);
                    console.log("Is owner:", userData.isOwner);
                    console.log("Is in org:", userData.organization_id);
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        };

        fetchUserRole();
    }, []);

    useEffect(() => {
        const fetchUsersList = async () => {
            if (isInOrg) {
                try {
                    const accessToken = localStorage.getItem('accessToken');
                    if (accessToken) {
                        const usersList = await fetchUsers(isInOrg, accessToken);
                        setUsers(usersList);
                    }
                } catch (error) {
                    console.error('Error fetching users:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUsersList();
    }, [isInOrg]);

    const handleRemoveUser = async (user: User) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && isInOrg) {
                const status = await removeUser(isInOrg, organisationName, user.email, accessToken);
                if (status === 200) {
                    setUsers(users.filter(u => u.id !== user.id));
                }
            }
        } catch (error) {
            console.error('Error removing user:', error);
        }
    };

    const handleAddMember = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && isInOrg) {
                const newUser = await addUser(isInOrg, organisationName, newMemberEmail, accessToken);
                setUsers([...users, {
                    id: newUser.user_id,
                    email: newUser.username,
                    name: newUser.username.split('@')[0], // Assuming name is part of the email before @
                    role: newUser.role,
                    createdAt: newUser.createdAt // Adjust if necessary
                }]);
                setNewMemberEmail('');
            }
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    const handleDeleteOrganisation = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && isInOrg) {
                const status = await deleteOrganisation(isInOrg, organisationName, accessToken);
                if (status === 200) {
                    setIsInOrg(null);
                    setOrganisationName('');
                    setConfirmOrganisationName('');
                    setDeleteConfirmed(true);
                }
            }
        } catch (error) {
            console.error('Error deleting organisation:', error);
        }
    };

    const handleChangeOrganisationName = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && isInOrg) {
                const status = await changeOrganisationName(isInOrg, organisationName, confirmOrganisationName, accessToken);
                if (status === 200) {
                    setOrganisationName(confirmOrganisationName);
                    setConfirmOrganisationName('');
                }
            }
        } catch (error) {
            console.error('Error changing organisation name:', error);
        }
    };

    const handleCreateNewOrganisation = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const username = localStorage.getItem('username');
            if (accessToken && username) {
                const orgData = await createOrganisation(organisationName, username, accessToken);
                setIsInOrg(orgData.id);
            }
        } catch (error) {
            console.error('Error creating organisation:', error);
        }
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'left', resizable: false },
        { field: 'email', headerName: 'Email', flex: 1, headerAlign: 'left', resizable: false },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 0.5,
            headerAlign: 'left',
            align: 'left',
            disableColumnMenu: true,
            renderCell: (params: GridRenderCellParams) => (
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
                    onClick={() => handleRemoveUser(params.row)}
                >
                    Remove
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <Box sx={mainContentStyles}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    if (isInOrg === null) {
        return (
            <Box sx={mainContentStyles}>
                <Box sx={headingBoxStyles}>
                    <Typography variant="h4" sx={{ marginBottom: 2 }}>
                        You are not part of an organisation
                    </Typography>
                </Box>
                <Card sx={cardStyles}>
                    <CardContent>
                        <Typography variant="h6" color="text.primary">Create Organisation?</Typography>
                        <TextField
                            required
                            margin="normal"
                            fullWidth
                            id="new-organisation-name"
                            label="Organisation Name"
                            name="new-organisation-name"
                            autoComplete="organisation-name"
                            autoFocus
                            InputLabelProps={{ sx: { color: 'text.primary' } }}
                            InputProps={{ sx: { color: 'text.primary' } }}
                            value={organisationName}
                            onChange={(e) => setOrganisationName(e.target.value)}
                            sx={textFieldStyles}
                        />
                        <Button
                            variant="contained"
                            sx={buttonStyles}
                            onClick={handleCreateNewOrganisation}
                        >
                            Create Organisation
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={mainContentStyles}>
            <Box sx={headingBoxStyles}>
                <Typography variant="h4" sx={{ marginBottom: 2 }}>
                    Organisation
                </Typography>
            </Box>
            <Box sx={{ height: '50vh', width: '100%', overflow: 'auto', marginBottom: '1rem' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    getRowId={(row) => row.id}
                    sx={{
                        width: '100%',
                        color: 'text.primary',
                        fontWeight: 500,
                        borderColor: 'text.primary',
                        '& .MuiDataGrid-columnHeader': {
                            backgroundColor: 'background.paper',
                            color: 'text.primary',
                        },
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
                    }}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <Card sx={cardStyles}>
                    <CardContent>
                        <Typography variant="h6" color="text.primary">Add a Member</Typography>
                        <TextField
                            required
                            margin="normal"
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            InputLabelProps={{ sx: { color: 'text.primary' } }}
                            InputProps={{ sx: { color: 'text.primary' } }}
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            sx={textFieldStyles}
                        />
                        <Button variant="contained" sx={buttonStyles} onClick={handleAddMember}>
                            Add Member
                        </Button>
                    </CardContent>
                </Card>
                <Card sx={cardStyles}>
                    <CardContent>
                        <Typography variant="h6" color="text.primary">Change Organisation Name</Typography>
                        <TextField
                            required
                            margin="normal"
                            fullWidth
                            id="organisation-name"
                            label="Organisation Name"
                            name="organisation-name"
                            autoComplete="organisation-name"
                            autoFocus
                            InputLabelProps={{ sx: { color: 'text.primary' } }}
                            InputProps={{ sx: { color: 'text.primary' } }}
                            value={confirmOrganisationName}
                            onChange={(e) => setConfirmOrganisationName(e.target.value)}
                            sx={textFieldStyles}
                        />
                        <Button variant="contained" sx={buttonStyles} onClick={handleChangeOrganisationName}>
                            Change Name
                        </Button>
                    </CardContent>
                </Card>
                <Card sx={cardStyles}>
                    <CardContent>
                        <Typography variant="h6" color="text.primary">Disband Organisation</Typography>
                        <TextField
                            required
                            margin="normal"
                            fullWidth
                            id="confirm-organisation-name"
                            label="Confirm Organisation Name"
                            name="confirm-organisation-name"
                            autoComplete="organisation-name"
                            InputLabelProps={{ sx: { color: 'text.primary' } }}
                            InputProps={{ sx: { color: 'text.primary' } }}
                            value={confirmOrganisationName}
                            onChange={(e) => setConfirmOrganisationName(e.target.value)}
                            sx={textFieldStyles}
                        />
                        <br></br>
                        <br></br>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: '#D11C45',
                                color: '#FFFFFF',
                                width: '100%',
                                '&:hover': {
                                    backgroundColor: '#B2163B',
                                },
                            }}
                            onClick={handleDeleteOrganisation}
                            disabled={confirmOrganisationName === '' || confirmOrganisationName !== organisationName || deleteConfirmed}
                        >
                            Delete Organisation
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default Organisation;
