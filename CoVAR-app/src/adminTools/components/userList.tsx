import React, { useEffect, useState } from 'react';
import { CircularProgress, Button, Typography, Menu, TextField, MenuItem, ListItemText } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Timestamp } from 'firebase/firestore';

type User = {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Timestamp;
};

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleRoleToggle = async (user: User) => {
        const newRole = user.role === 'VA' ? 'client' : 'VA';
        const userRef = doc(db, 'user', user.id);

        try {
            await updateDoc(userRef, { role: newRole });
            setUsers(users.map(u => (u.id === user.id ? { ...u, role: newRole } : u)));
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, user: User) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
        setSearchTerm('');
    };

    const handleAssignClient = async (clientEmail: string) => {
        if (selectedUser) {
            // Add logic to assign the client to the VA.
            console.log(`Assign ${clientEmail} to ${selectedUser.email}`);
            handleMenuClose();
        }
    };

    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) && user.role !== 'VA'
    );

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'left', resizable: false },
        { field: 'email', headerName: 'Email', flex: 1, headerAlign: 'left', resizable: false },
        { field: 'role', headerName: 'Role', flex: 1, headerAlign: 'left', resizable: false },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
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
                                    paddingLeft: '10px',
                                }}
                                onClick={(event) => handleMenuOpen(event, params.row)}
                            >
                                Assign Client
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
            <DataGrid
                rows={users}
                columns={columns}
                sx={{
                    height: 600,
                    flex: '1 auto',
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
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <TextField
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search email"
                    fullWidth
                    sx={{ margin: '8px' }}
                />
                {filteredUsers.map(user => (
                    <MenuItem key={user.id} onClick={() => handleAssignClient(user.email)}>
                        <ListItemText primary={user.email} />
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default UserList;