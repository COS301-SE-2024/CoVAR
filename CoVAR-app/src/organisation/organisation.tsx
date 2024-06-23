import { Button, Card, CardContent, CircularProgress, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import axios from 'axios';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getUserRole } from '../requests/requests';
import { buttonStyles, cardStyles, headingBoxStyles, mainContentStyles, textFieldStyles } from '../styles/organisationStyle';

type User = {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Timestamp;
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
    const [isInOrg, setIsInOrg] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (accessToken) {
                    const userData = await getUserRole(accessToken);
                    setRole(userData.role);
                    setIsOwner(userData.isOwner);
                    setIsInOrg(userData.isInOrg);
                    setUsername(userData.username);
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        };

        fetchUserRole();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.post(
                    '/api/organizations/users',
                    { org_id: isInOrg },
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                    }
                );
                const usersList = response.data;
                setUsers(usersList);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isInOrg]);

    const handleRemoveUser = async (user: User) => {
        try {
            const response = await axios.post(
                `/api/organizations/${isInOrg}/remove_user`,
                {
                    organizationId: isInOrg,
                    OrgName: organisationName,
                    username: user.email,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                }
            );
            if (response.status === 200) {
                setUsers(users.filter(u => u.id !== user.id));
            }
        } catch (error) {
            console.error('Error removing user:', error);
        }
    };

    const handleAddMember = async () => {
        try {
            const response = await axios.post(
                `/api/organizations/${isInOrg}/add_user`,
                {
                    organizationId: isInOrg,
                    OrgName: organisationName,
                    username: newMemberEmail,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                }
            );
            if (response.status === 200) {
                const newUser = response.data;
                setUsers([...users, newUser]);
                setNewMemberEmail('');
            }
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    const handleDeleteOrganisation = async () => {
        try {
            const response = await axios.post(
                `/api/organizations/${isInOrg}/delete`,
                {
                    organizationId: isInOrg,
                    OrgName: organisationName,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                }
            );
            if (response.status === 200) {
                setIsInOrg(false);
                setOrganisationName('');
                setConfirmOrganisationName('');
                setDeleteConfirmed(true);
            }
        } catch (error) {
            console.error('Error deleting organisation:', error);
        }
    };

    const handleChangeOrganisationName = async () => {
        try {
            const response = await axios.patch(
                `/api/organizations/${isInOrg}/change_name`,
                {
                    OrgName: organisationName,
                    newName: confirmOrganisationName,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                }
            );
            if (response.status === 200) {
                setOrganisationName(confirmOrganisationName);
                setConfirmOrganisationName('');
            }
        } catch (error) {
            console.error('Error changing organisation name:', error);
        }
    };

    const createOrganisation = async () => {
        try {
            const response = await axios.post(
                '/api/organizations/create',
                {
                    name: organisationName,
                    username: username,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                }
            );
            if (response.status === 201) {
                setIsInOrg(response.data.id);
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

    if (!isInOrg) {
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
                            onClick={createOrganisation}
                        >
                            Create Organisation
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    } else {
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
                        sx={{
                            width: '100%',
                            color: 'text.primary',
                            fontWeight: 500,
                            borderColor: 'text.primary',
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
    }
};

export default Organisation;
