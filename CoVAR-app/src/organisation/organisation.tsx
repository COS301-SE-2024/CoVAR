import React, { useEffect, useState } from 'react';
import { CircularProgress, Button, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import { Box } from '@mui/system';
import { mainContentStyles } from '../styles/organisationStyle';

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
            <Typography variant="h4" sx={{ marginBottom: 2 }}>
                Organisation
            </Typography>
            <div style={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    sx={{
                        height: 600,
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
        </Box>
    );
};

export default Organisation;
