import React, { useEffect, useState } from 'react';
import { CircularProgress, Button, Typography, Card, CardContent, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';
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
        // Implement the logic to change the organisation name
        console.log('Change organisation name to:', organisationName);
        setOrganisationName('');
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
                        // bgcolor: 'primary.main',
                        color: 'text.primary',
                        borderColor: 'primary.main',
                        '& .MuiDataGrid-columnHeader': {
                            backgroundColor: 'primary.main',
                            color: 'text.primary',
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            color: 'text.primary',
                        },
                        '& .MuiDataGrid-columnSeparator': {
                            color: 'primary.main',
                        },
                        '& .MuiDataGrid-cell': {
                            color: 'text.primary',
                            borderColor: 'primary.main',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            backgroundColor: 'primary.main',
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
                    }}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 3, marginTop: 6 }}>
                <Card sx={cardStyles}>
                    <CardContent>
                        <Typography variant="h6">Add a Member</Typography>
                        <TextField
                            margin="normal"
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            InputLabelProps={{ style: { color: 'text.primary' } }}
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
                        <Typography variant="h6">Change Organisation Name</Typography>
                        <TextField
                            margin="normal"
                            fullWidth
                            id="organisation-name"
                            label="Organisation Name"
                            name="organisation-name"
                            autoComplete="organisation-name"
                            autoFocus
                            InputLabelProps={{ style: { color: 'text.primary' } }}
                            value={organisationName}
                            onChange={(e) => setOrganisationName(e.target.value)}
                            sx={textFieldStyles}
                        />
                        <Button variant="contained" sx={buttonStyles} onClick={handleChangeOrganisationName}>
                            Change Name
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default Organisation;
