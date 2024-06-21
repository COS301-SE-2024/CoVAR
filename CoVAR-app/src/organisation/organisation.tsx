import React, { useEffect, useState } from 'react';
import { CircularProgress, Button, Typography, Card, CardContent, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import { Box } from '@mui/system';
import { mainContentStyles, cardStyles, headingBoxStyles, textFieldStyles, buttonStyles } from '../styles/organisationStyle';

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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'user'));
                const usersList: User[] = [];
                for (const userDoc of querySnapshot.docs) {
                    const userRef = doc(db, 'user', userDoc.id);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        usersList.push({ id: userDoc.id, ...userSnap.data() } as User);
                    } else {
                        console.log('No such document for user:', userDoc.id);
                    }
                }
                setUsers(usersList);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user:', error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRemoveUser = async (user: User) => {
        const userRef = doc(db, 'user', user.id);

        try {
            await updateDoc(userRef, { organisation: null });
            setUsers(users.filter(u => u.id !== user.id));
        } catch (error) {
            console.error('Error removing user from organisation:', error);
        }
    };

    const handleAddMember = async () => {
        try {
            const newUserRef = await addDoc(collection(db, 'user'), {
                email: newMemberEmail,
                name: 'New User',
                role: 'Member',
                createdAt: Timestamp.now(),
                organisation: 'YourOrganisation',
            });
            const newUserSnap = await getDoc(newUserRef);
            if (newUserSnap.exists()) {
                setUsers([...users, { id: newUserRef.id, ...newUserSnap.data() } as User]);
                setNewMemberEmail('');
            }
        } catch (error) {
            console.error('Error adding new member:', error);
        }
    };

    const handleChangeOrganisationName = async () => {
        // Verify if confirmOrganisationName matches organisationName
        if (confirmOrganisationName !== organisationName) {
            console.error('Organisation names do not match. Aborting.');
            return;
        }

        try {
            // Implement the logic to delete the organisation
            console.log('Disbanding organisation:', organisationName);

            // Example deletion using Firestore
            const organisationRef = doc(db, 'organizations', 'your-organisation-id');
            await deleteDoc(organisationRef);

            // After deletion, you may want to clear state or redirect

            // Reset fields after successful deletion
            setOrganisationName('');
            setConfirmOrganisationName('');
            setDeleteConfirmed(false);
        } catch (error) {
            console.error('Error deleting organisation:', error);
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
            renderCell: (params: GridRenderCellParams) => {
                return (
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
                );
            },
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
                            value={organisationName}
                            onChange={(e) => setOrganisationName(e.target.value)}
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
                            autoFocus
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
                            onClick={handleChangeOrganisationName}
                            disabled={confirmOrganisationName !== organisationName || deleteConfirmed}
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
