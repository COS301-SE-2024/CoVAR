import React, { useEffect, useState } from 'react';
import { CircularProgress, Button, Typography, Card, CardContent, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import { Box } from '@mui/system';
import { mainContentStyles, cardStyles, headingBoxStyles, textFieldStyles } from '../styles/organisationStyle';

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
                organisation: 'YourOrganisation', // Replace with actual organisation ID or name
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
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </div>
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
            <div style={{ height: '50vh', width: '100%', overflow: 'auto', marginBottom: '1rem' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    sx={{
                        width: '100%',
                        '& .MuiDataGrid-root': {
                            bgcolor: '#52796F',
                            color: '#CAD2C5',
                            borderColor: '#52796F',
                        },
                        '& .MuiDataGrid-columnHeader': {
                            backgroundColor: '#2F3E46',
                            color: '#CAD2C5',
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            color: '#CAD2C5',
                        },
                        '& .MuiDataGrid-columnSeparator': {
                            color: '#52796F',
                        },
                        '& .MuiDataGrid-cell': {
                            color: '#CAD2C5',
                            borderColor: '#52796F',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            backgroundColor: '#2F3E46',
                            color: '#CAD2C5',
                        },
                        '& .MuiTablePagination-root': {
                            color: '#CAD2C5',
                        },
                        '& .MuiSvgIcon-root': {
                            color: '#CAD2C5',
                        },
                        '& .MuiDataGrid-toolbarContainer button': {
                            color: '#CAD2C5',
                        },
                        '& .MuiDataGrid-topContainer, & .MuiDataGrid-container--top': {
                            backgroundColor: '#52796F',
                        },
                        '& .MuiDataGrid-overlay': {
                            backgroundColor: '#1F282E',
                            color: '#CAD2C5',
                        },
                    }}
                />
            </div>
            <Box sx={{ display: 'flex', gap: 2, marginTop: 4 }}>
                <Card sx={{ ...cardStyles, width: 'calc(50% - 16px)' }}>
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
                            InputLabelProps={{
                            style: { color: '#CAD2C5' },
                            }}
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                borderColor: '#CAD2C5',
                                },
                                '&:hover fieldset': {
                                borderColor: '#CAD2C5',
                                },
                                '&.Mui-focused fieldset': {
                                borderColor: '#52796F',
                                },
                            },
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: '#52796F', color: '#CAD2C5', width: '100%' }}
                            onClick={handleAddMember}
                        >
                            Add Member
                        </Button>
                    </CardContent>
                </Card>
                <Card sx={{ ...cardStyles, width: 'calc(50% - 16px)' }}>
                    <CardContent>
                        <Typography variant="h6">Change Organisation Name</Typography>
                        <TextField
                            margin="normal"
                            fullWidth
                            id="organisationName"
                            label="New Organisation Name"
                            autoFocus
                            InputLabelProps={{
                            style: { color: '#CAD2C5' },
                            }}
                            value={organisationName}
                            onChange={(e) => setOrganisationName(e.target.value)}
                            sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                borderColor: '#CAD2C5',
                                },
                                '&:hover fieldset': {
                                borderColor: '#CAD2C5',
                                },
                                '&.Mui-focused fieldset': {
                                borderColor: '#52796F',
                                },
                            },
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: '#52796F', color: '#CAD2C5', width: '100%' }}
                            onClick={handleChangeOrganisationName}
                        >
                            Change Name
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default Organisation;
