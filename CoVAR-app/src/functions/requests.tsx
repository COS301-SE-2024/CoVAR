import axios from 'axios';
export const checkToken = async (accessToken: string) => {
    try {
        const response = await axios.post('/api/checkToken', { accessToken });
        return response.data;
    } catch (error) {
        console.error('Error checking token:', error);
        throw error;
    }
};
export const fetchUsers = async (accessToken: string) => {
    try {
        const response = await axios.get('/api/users/all', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const fetchOrganisations = async (accessToken: string) => {
    try {
        const response = await axios.get('/api/organizations/all', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching organizations:', error);
        throw error;
    }
};

export const updateUserRole = async (userId: string, role: string, accessToken: string) => {
    try {
        await axios.patch(`/api/users/${userId}/role`, { role }, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

export const fetchAssignedClients = async (userId: string, accessToken: string) => {
    try {
        const response = await axios.get(`/api/users/${userId}/assigned_clients`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching assigned clients:', error);
        throw error;
    }
};

export const fetchAssignedOrganisations = async (userId: string, accessToken: string) => {
    try {
        const response = await axios.get(`/api/users/${userId}/assigned_organizations`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching assigned organizations:', error);
        throw error;
    }
};

export const assignClient = async (userId: string, clientUsername: string, accessToken: string) => {
    try {
        await axios.post(`/api/users/${userId}/assign`, { clientUsername }, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    } catch (error) {
        console.error('Error assigning client:', error);
        throw error;
    }
};

export const unassignClient = async (userId: string, clientUsername: string, accessToken: string) => {
    try {
        await axios.post(`/api/users/${userId}/unassign`, { clientUsername }, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    } catch (error) {
        console.error('Error unassigning client:', error);
        throw error;
    }
};

export const getUserRole = async (accessToken: string) => {
    try {
        const response = await axios.post(
            '/api/getUser',
            { accessToken },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching user role:", error);
        throw error;
    }
};

export const fetchUsersByOrg = async (orgId: string, accessToken: string) => {
    try {
        const response = await axios.post(
            '/api/organizations/users',
            { org_id: orgId },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data.map((user: any) => ({
            id: user.user_id,
            email: user.username,
            role: user.role,
            createdAt: user.createdAt,
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const removeUser = async (orgId: string, ownerId: string, email: string, accessToken: string) => {
    try {
        const response = await axios.post(
            `/api/organizations/${ownerId}/remove_user`,
            { organizationId: orgId, username: email },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.status;
    } catch (error) {
        console.error('Error removing user:', error);
        throw error;
    }
};

export const addUser = async (orgId: string, ownerId: string, email: string, accessToken: string) => {
    try {
        const response = await axios.post(
            `/api/organizations/${ownerId}/add_user`,
            { organizationId: orgId, username: email },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding member:', error);
        throw error;
    }
};

export const deleteOrganisation = async (orgId: string, organisationName: string, accessToken: string) => {
    try {
        const response = await axios.post(
            `/api/organizations/${orgId}/delete`,
            { organizationId: orgId, OrgName: organisationName },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.status;
    } catch (error) {
        console.error('Error deleting organisation:', error);
        throw error;
    }
};

export const changeOrganisationName = async (ownerId: string, organisationName: string, newName: string, accessToken: string) => {
    try {
        const response = await axios.patch(
            `/api/organizations/${ownerId}/change_name`,
            { OrgName: organisationName, newName: newName },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.status;
    } catch (error) {
        console.error('Error changing organization name:', error);
        throw error;
    }
};

export const createOrganisation = async (organisationName: string, username: string, accessToken: string) => {
    try {
        const response = await axios.post(
            '/api/organizations/create',
            { name: organisationName, username },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating organization:', error);
        throw error;
    }
};
