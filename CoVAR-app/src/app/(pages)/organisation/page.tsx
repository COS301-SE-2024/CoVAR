'use client'
import { useEffect, useState, useCallback } from 'react';
import { Button, Card, CardContent, CircularProgress, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { getUserRole, fetchUsersByOrg, removeUser, addUser, deleteOrganisation, createOrganisation, changeOrganisationName } from '../../../functions/requests';
import { buttonStyles, cardStyles, headingBoxStyles, mainContentStyles, textFieldStyles } from '../../../styles/organisationStyle';

type User = {
    id: string;
    email: string;
    role: string;
    createdAt?: string;
};

const Organisation = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [organisationName, setOrganisationName] = useState('');
    const [confirmChangeOrganisationName, setConfirmChangeOrganisationName] = useState('');
    const [confirmDisbandOrganisationName, setConfirmDisbandOrganisationName] = useState('');
    const [deleteConfirmed, setDeleteConfirmed] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [isInOrg, setIsInOrg] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [addMemberMessage, setAddMemberMessage] = useState<string | null>(null);
    const [changeNameMessage, setChangeNameMessage] = useState<string | null>(null);
    const [disbandOrgMessage, setDisbandOrgMessage] = useState<string | null>(null);

    const fetchUsersList = useCallback(async () => {
        if (isInOrg) {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (accessToken) {
                    const usersList = await fetchUsersByOrg(isInOrg, accessToken);
                    const usersWithId = usersList.map((user: User, index: number) => ({
                        ...user,
                        id: user.id || index.toString(),
                    }));
                    setUsers(usersWithId);
                    console.log("Users list:", usersWithId);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [isInOrg]);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (accessToken) {
                    const userData = await getUserRole(accessToken);
                    console.log('User data:', userData);
                    setIsOwner(userData.owner); // Assuming 'owner' is the correct key in userData
                    setIsInOrg(userData.organization_id);
                    setUsername(userData.username);
                    setOwnerId(userData.user_id);
                    console.log("User role:", userData.role);
                    console.log("Is owner:", userData.owner);
                    console.log("Is in org:", userData.organization_id);
                    // Set the organisation name if user is in an organisation
                    if (userData.orgName) {
                        setOrganisationName(userData.orgName);
                    }
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }, []);

    useEffect(() => {
        fetchUsersList();
    }, [fetchUsersList]);

    const handleRemoveUser = async (user: User) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && isInOrg && ownerId) {
                const status = await removeUser(isInOrg, ownerId, user.email, accessToken);
                if (status === 200) {
                    setUsers(users.filter((u) => u.id !== user.id));
                }
            }
        } catch (error) {
            console.error('Error removing user:', error);
        }
    };

    const handleAddMember = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && isInOrg && ownerId) {
                await addUser(isInOrg, ownerId, newMemberEmail, accessToken);
                setNewMemberEmail('');
                fetchUsersList();
                setAddMemberMessage('Member added successfully.');
                setTimeout(() => setAddMemberMessage(null), 10000);
            }
        } catch (error) {
            console.error('Error adding member:', error);
            setAddMemberMessage('Error adding member.');
            setTimeout(() => setAddMemberMessage(null), 10000);
        }
    };

    const handleChangeOrganisationName = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && isInOrg) {
                const status = await changeOrganisationName(
                    (ownerId !== null ? ownerId : ''),
                    organisationName,
                    confirmChangeOrganisationName,
                    accessToken
                );
                if (status === 200) {
                    setOrganisationName(confirmChangeOrganisationName);
                    setConfirmChangeOrganisationName('');
                    setChangeNameMessage('Organisation name changed successfully');
                    setTimeout(() => setChangeNameMessage(null), 10000);
                }
            }
        } catch (error) {
            console.error('Error changing organisation name:', error);
            setChangeNameMessage('Error changing organisation name');
            setTimeout(() => setChangeNameMessage(null), 10000);
        }
    };

    const handleDeleteOrganisation = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && isInOrg) {
                const status = await deleteOrganisation(
                    isInOrg,
                    confirmDisbandOrganisationName,
                    accessToken
                );
                if (status === 200) {
                    setIsInOrg(null);
                    setOrganisationName('');
                    setConfirmDisbandOrganisationName('');
                    setDeleteConfirmed(true);
                    setDisbandOrgMessage('Organisation disbanded successfully');
                    setTimeout(() => setDisbandOrgMessage(null), 10000);
                }
            }
        } catch (error) {
            console.error('Error deleting organisation:', error);
            setDisbandOrgMessage('Error disbanding organisation.');
            setTimeout(() => setDisbandOrgMessage(null), 10000);
        }
    };

    const handleCreateNewOrganisation = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken && username) {
                const orgData = await createOrganisation(organisationName, username, accessToken);
                setIsInOrg(orgData.id);
                setOrganisationName(orgData.name); 
            }
        } catch (error) {
            console.error('Error creating organisation:', error);
        }
    };

    const columns: GridColDef[] = [
        { field: 'email', headerName: 'Email', flex: 1, headerAlign: 'left', resizable: false },
        {
            resizable: false,
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
                    disabled={!isOwner || params.row.email === username}
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
                        <Typography variant="h6" color="text.primary">
                            Create Organisation?
                        </Typography>
                        <TextField
                            required
                            margin="normal"
                            fullWidth
                            id="new-organisation-name"
                            label="Organisation Name"
                            name="new-organisation-name"
                            autoComplete="organisation-name"
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
                    {organisationName}
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
            {isOwner && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 6 }}>
                    <Card sx={cardStyles}>
                        <CardContent>
                            <Typography variant="h6" color="text.primary">
                                Add a Member
                            </Typography>
                            <TextField
                                required
                                margin="normal"
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                InputLabelProps={{ sx: { color: 'text.primary' } }}
                                InputProps={{ sx: { color: 'text.primary' } }}
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                sx={textFieldStyles}
                            />
                            <Button variant="contained" sx={buttonStyles} onClick={handleAddMember}>
                                Add Member
                            </Button>
                            <Box sx={{ mt: 1, textAlign: 'center' }}>
                            {addMemberMessage && (
                                <Typography
                                    variant="body2"
                                    color={addMemberMessage.startsWith('Error') ? 'error.main' : 'success.main'}
                                    sx={{ 
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap',
                                        mb: 4  
                                    }}
                                >
                                    {addMemberMessage}
                                </Typography>
                            )}
                            </Box>
                        </CardContent>
                    </Card>
                    <Card sx={cardStyles}>
                        <CardContent>
                            <Typography variant="h6" color="text.primary">
                                Change Organisation Name
                            </Typography>
                            <TextField
                                required
                                margin="normal"
                                fullWidth
                                id="organisation-name"
                                label="Organisation Name"
                                name="organisation-name"
                                autoComplete="organisation-name"
                                InputLabelProps={{ sx: { color: 'text.primary' } }}
                                InputProps={{ sx: { color: 'text.primary' } }}
                                value={confirmChangeOrganisationName}
                                onChange={(e) => setConfirmChangeOrganisationName(e.target.value)}
                                sx={textFieldStyles}
                            />
                            <Button variant="contained" sx={buttonStyles} onClick={handleChangeOrganisationName}>
                                Change Name
                            </Button>
                            <Box sx={{ mt: 1, textAlign: 'center' }}>
                            {changeNameMessage && (
                                <Typography
                                    variant="body2"
                                    color={changeNameMessage.startsWith('Error') ? 'error.main' : 'success.main'}
                                    sx={{ 
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap',
                                        mb: 4  
                                    }}
                                >
                                    {changeNameMessage}
                                </Typography>
                                
                            )}
                            </Box>
                        </CardContent>
                    </Card>
                    <Card sx={cardStyles}>
                        <CardContent>
                            <Typography variant="h6" color="text.primary">
                                Disband Organisation
                            </Typography>
                            <TextField
                                required
                                margin="normal"
                                fullWidth
                                id="confirm-disband-organisation-name"
                                label="Confirm Organisation Name"
                                name="confirm-disband-organisation-name"
                                autoComplete="organisation-name"
                                InputLabelProps={{ sx: { color: 'text.primary' } }}
                                InputProps={{ sx: { color: 'text.primary' } }}
                                value={confirmDisbandOrganisationName}
                                onChange={(e) => setConfirmDisbandOrganisationName(e.target.value)}
                                sx={textFieldStyles}
                            />
                            <Button
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    backgroundColor: '#D11C45',
                                    color: '#FFFFFF',
                                    width: '100%',
                                    '&:hover': {
                                        backgroundColor: '#B2163B',
                                    },
                                }}
                                onClick={handleDeleteOrganisation}
                                disabled={
                                    confirmDisbandOrganisationName === '' ||
                                    confirmDisbandOrganisationName !== organisationName ||
                                    deleteConfirmed
                                }
                            >
                                Delete Organisation
                            </Button>
                            <Box sx={{ mt: 1, textAlign: 'center' }}>
                            {disbandOrgMessage && (
                                <Typography
                                    variant="body2"
                                    color={disbandOrgMessage.startsWith('Error') ? 'error.main' : 'success.main'}
                                    sx={{ 
                                        display: 'inline-block',
                                        whiteSpace: 'nowrap',
                                        mb: 4  
                                    }}
                                >
                                    {disbandOrgMessage}
                                </Typography>    
                            )}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
};

export default Organisation;
