import React, { useEffect, useState } from 'react';
import { Button, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { doc, getDoc, updateDoc, collection, getDocs, Firestore } from 'firebase/firestore';
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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const usersList: User[] = [];

                for (const userDoc of querySnapshot.docs) {
                    const userRef = doc(db, 'users', userDoc.id);
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
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRoleToggle = async (user: User) => {
        const newRole = user.role === 'VA' ? 'Client' : 'VA';
        const userRef = doc(db, 'users', user.id);

        try {
            await updateDoc(userRef, { role: newRole });
            setUsers(users.map(u => (u.id === user.id ? { ...u, role: newRole } : u)));
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <List>
            {users.map(user => (
                <ListItem key={user.id}>
                    <ListItemText
                        primary={user.name}
                        secondary={`Email: ${user.email}, Role: ${user.role}, Created At: ${user.createdAt.toDate().toLocaleString()}`}
                    />
                    <Button
                        variant="contained"
                        color={user.role === 'VA' ? 'secondary' : 'primary'}
                        onClick={() => handleRoleToggle(user)}
                    >
                        {user.role === 'VA' ? 'Unassign' : 'Assign VA'}
                    </Button>
                </ListItem>
            ))}
        </List>
    );
};

export default UserList;