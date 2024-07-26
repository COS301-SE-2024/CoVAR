import axios, { AxiosRequestConfig, ResponseType } from 'axios';
import { doSignOut } from './firebase/auth';

const signOut = async () => {
    try {
        await doSignOut();
    } catch (error) {
        console.error('signout error', error);
    }
};

const refreshAccessToken = async (): Promise<string> => {
    //console.log('Refreshing access token...');
    try {
        const token = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/users/refresh', { token });
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data.accessToken;
    } catch (error) {
        //console.error('Error refreshing access token:', error);
        await signOut(); // Sign out the user
        throw error;
    }
};

const retryRequestWithNewToken = async (originalRequest: AxiosRequestConfig) => {
    //console.log('Retrying request with new token...');
    let newAccessToken;
    try {
        newAccessToken = await refreshAccessToken();
    } catch (error) {
        //console.error('Error refreshing access token:', error);
        throw error;
    }
    //console.log('New access token:', newAccessToken);

    const updatedRequest = {
        ...originalRequest,
        headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`
        }
    };

    if (typeof updatedRequest.data === 'string') {
        try {
            const data = JSON.parse(updatedRequest.data);
            if (data && data.accessToken) {
                data.accessToken = newAccessToken;
                updatedRequest.data = JSON.stringify(data);
            }
        } catch (error) {
            console.error('Error parsing request data:', error);
        }
    }

    //console.log('Updated request:', updatedRequest);

    const method = updatedRequest.method?.toLowerCase();

    switch (method) {
        case 'get':
            return axios.get(updatedRequest.url as string, { headers: updatedRequest.headers });
        case 'post':
            return axios.post(updatedRequest.url as string, updatedRequest.data, { headers: updatedRequest.headers });
        case 'put':
            return axios.put(updatedRequest.url as string, updatedRequest.data, { headers: updatedRequest.headers });
        case 'patch':
            return axios.patch(updatedRequest.url as string, updatedRequest.data, { headers: updatedRequest.headers });
        case 'delete':
            return axios.delete(updatedRequest.url as string, { headers: updatedRequest.headers });
        default:
            throw new Error(`Unsupported request method: ${method}`);
    }
};

const handleRequest = async (request: AxiosRequestConfig) => {
    try {
        //console.log('Sending request...');
        //console.log('Request:', request);
        const response = await axios(request);
        //console.log('Response:', response);
        return response.data;
    } catch (error: any) {
        //console.error('Error in handle request:', error);
        if (error.response && error.response.status === 403) {
            try {
                //console.log('Error config:', error.config);
                const response = await retryRequestWithNewToken(error.config);
                //console.log('Returning after retry');
                return response.data;
            } catch (retryError) {
                //console.error('Error after retrying request:', retryError);
                throw retryError;
            }
        } else {
            //console.error('Request error:', error);
            throw error;
        }
    }
};

// Exported functions remain unchanged
export const checkToken = async (accessToken: string) => {
    const request = {
        method: 'post',
        url: '/api/checkToken',
        data: { accessToken },
    };
    return await handleRequest(request);
};

export const fetchUsers = async (accessToken: string) => {
    const request = {
        method: 'get',
        url: '/api/users/all',
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const fetchOrganisations = async (accessToken: string) => {
    const request = {
        method: 'get',
        url: '/api/organizations/all',
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const updateUserRole = async (userId: string, role: string, accessToken: string) => {
    const request = {
        method: 'patch',
        url: `/api/users/${userId}/role`,
        data: { role },
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const fetchAssignedClients = async (userId: string, accessToken: string) => {
    const request = {
        method: 'get',
        url: `/api/users/${userId}/assigned_clients`,
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const fetchAssignedOrganisations = async (userId: string, accessToken: string) => {
    const request = {
        method: 'get',
        url: `/api/users/${userId}/assigned_organizations`,
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const assignClient = async (userId: string, clientUsername: string, accessToken: string) => {
    const request = {
        method: 'post',
        url: `/api/users/${userId}/assign`,
        data: { clientUsername },
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const unassignClient = async (userId: string, clientUsername: string, accessToken: string) => {
    const request = {
        method: 'post',
        url: `/api/users/${userId}/unassign`,
        data: { clientUsername },
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const getUserRole = async (accessToken: string) => {
    const request = {
        method: 'post',
        url: '/api/getUser',
        data: { accessToken },
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const fetchUsersByOrg = async (orgId: string, accessToken: string) => {
    const request = {
        method: 'post',
        url: '/api/organizations/users',
        data: { org_id: orgId },
        headers: { Authorization: `Bearer ${accessToken}` },
    };

    try {
        const response = await handleRequest(request);
        return response.map((user: any) => ({
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
    const request = {
        method: 'post',
        url: `/api/organizations/${ownerId}/remove_user`,
        data: { organizationId: orgId, username: email },
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const addUser = async (orgId: string, ownerId: string, email: string, accessToken: string) => {
    const request = {
        method: 'post',
        url: `/api/organizations/${ownerId}/add_user`,
        data: { organizationId: orgId, username: email },
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const deleteOrganisation = async (orgId: string, organisationName: string, accessToken: string) => {
    const request = {
        method: 'post',
        url: `/api/organizations/${orgId}/delete`,
        data: { organizationId: orgId, OrgName: organisationName },
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const changeOrganisationName = async (ownerId: string, organisationName: string, newName: string, accessToken: string) => {
    const request = {
        method: 'patch',
        url: `/api/organizations/${ownerId}/change_name`,
        data: { OrgName: organisationName, newName: newName },
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const createOrganisation = async (organisationName: string, username: string, accessToken: string) => {
    const request = {
        method: 'post',
        url: '/api/organizations/create',
        data: { name: organisationName, username },
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const handleDownloadFile = async (loid: number, fileName: string) => {
    try {
        const token = localStorage.getItem('accessToken');
        const request: AxiosRequestConfig = {
            method: 'get',
            url: `/api/uploads/file/${loid}`,
            responseType: 'blob' as ResponseType,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        const response = await handleRequest(request);
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
    } catch (error: any) {
        console.error('Error downloading file:', error);
    }
};
