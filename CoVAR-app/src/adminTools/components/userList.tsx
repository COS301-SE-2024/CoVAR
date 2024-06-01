import React, { useEffect, useState } from 'react';
import { CircularProgress, Button } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
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

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', width: 400, headerAlign: 'left', resizable:false },
        { field: 'email', headerName: 'Email', width: 400, headerAlign: 'left', resizable:false },
        { field: 'role', headerName: 'Role', width: 250, headerAlign: 'left', resizable:false},
        
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            headerAlign: 'center',
            disableColumnMenu: true, 
            renderCell: (params: GridRenderCellParams) => (
                <Button
                    variant="contained"
                    color={params.row.role === 'VA' ? 'secondary' : 'primary'}
                    onClick={() => handleRoleToggle(params.row)}
                >
                    {params.row.role === 'VA' ? 'Unassign' : 'Assign VA'}
                </Button>
            ),
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
                width: '100%',
                
                '& .MuiDataGrid-root': {
                    bgcolor: '#2F3E46',
                    color: 'white',
                },
                '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#1F282E', 
                    color: 'black',
                },
                '& .MuiDataGrid-cell': {
                    color: 'white',
                    borderColor: '#1F282E', 
                },
               
                
            }}
        />
    </div>
    );
};

export default UserList;