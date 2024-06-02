import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../contexts/authContext/index';

type UserRole = string | null;

const useUserRole = (): UserRole => {
    const [userRole, setUserRole] = useState<UserRole>(null);
    const { currentUser } = useAuth(); 

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                if (currentUser) {
                    const userRef = doc(db, 'user', currentUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data() as { role: string };
                        setUserRole(userData?.role || null);
                    } else {
                        console.log('No such document for user:', currentUser.uid);
                    }
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }, [currentUser]);

    return userRole;
};

export default useUserRole;
