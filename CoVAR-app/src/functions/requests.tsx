import axios, { AxiosRequestConfig, ResponseType } from 'axios';
import { doSignOut } from './firebase/auth';
import { blob } from 'stream/consumers';

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
        const response = await axios(request);

        // Check if the URL ends with 'change_name', 'delete', or 'remove_user'
        const url = request.url?.toLowerCase();
        if (url?.endsWith('change_name') || url?.endsWith('delete') || url?.endsWith('remove_user')) {
            return response.status;
        }

        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 403) {
            try {
                const response = await retryRequestWithNewToken(error.config);

                // Check again after retrying with new token
                const url = error.config.url?.toLowerCase();
                if (url?.endsWith('change_name') || url?.endsWith('delete') || url?.endsWith('remove_user')) {
                    return response.status;
                }

                return response.data;
            } catch (retryError) {
                throw retryError;
            }
        } else {
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


export const deleteOrganisation = async (orgId: string, organisationName: string, accessToken: string) => {
    const request = {
        method: 'delete',
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
    const response = await handleRequest(request);
    return response;
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

export const fetchUnauthorizedUsers = async (search: string) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('Access token not found');
    }
    const request = {
        method: 'get',
        url: '/api/users/unauthorized',
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { search },
    };
    return await handleRequest(request);
};

export const authorizeUser = async (username: string, accessToken: string) => {
    const request = {
        method: 'patch',
        url: '/api/users/authorize',
        data: { username },
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const leaveOrganisation = async (orgId: string, username: string, accessToken: string) => {
    const request = {
        method: 'post',
        url: '/api/organizations/leave',
        data: { organizationId: orgId, username },
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


export const getAllReports = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const request = {
        method: 'get',
        url: '/api/reports/all',
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

export const fetchUploadsClient = async (username: string) => {
    const token = localStorage.getItem('accessToken');
    const request: AxiosRequestConfig = {
        method: 'get',
        url: `/api/uploads/client/${username}`,
        headers: { Authorization: `Bearer ${token}` },
    };
    return await handleRequest(request);
};

export const fetchUploadsOrganization = async (organizationName: string) => {
    const token = localStorage.getItem('accessToken');

    const request: AxiosRequestConfig = {
        method: 'get',
        url: `/api/uploads/organization/${organizationName}`,
        headers: { Authorization: `Bearer ${token}` },
    };
    return await handleRequest(request);
};

export const fetchReports = async (reportIds: number[]) => {
    const token = localStorage.getItem('accessToken');
    const fetchedReports = await Promise.all(
        reportIds.map(async (id) => {

            const request: AxiosRequestConfig = {
                method: 'get',
                url: `/api/uploads/generateSingleReport/${id}`,
                headers: { Authorization: `Bearer ${token}` },
            };
            return await handleRequest(request);
        })
    );
    return fetchedReports;
};

export const handleRemoveFile = async (upload_id: number) => {
    const token = localStorage.getItem('accessToken');

    const request: AxiosRequestConfig = {
        method: 'delete',
        url: `/api/uploads/${upload_id}`,
        headers: { Authorization: `Bearer ${token}` },
    };
    return await handleRequest(request);

};

export const handleToggleReport = async (upload_id: number) => {
    const token = localStorage.getItem('accessToken');
    const request: AxiosRequestConfig = {
        method: 'put',
        url: `/api/uploads/inReport/${upload_id}`,
        headers: { Authorization: `Bearer ${token}` },
    };
    return await handleRequest(request);

};


export const populateReportsTable = async () => {
    const token = localStorage.getItem('accessToken');
    //define req
    const request :AxiosRequestConfig = {
        method: 'post',
        url: `/api/reports/getReports`,
        headers: { Authorization: `Bearer ${token}` },
    };
   return await handleRequest(request);
};

export const fetchExecReport = async (reportId:any) => {
    const token = localStorage.getItem('accessToken');
    // const response = await fetch(`/api/reports/executive/${reportId}`, {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/pdf',
    //         Authorization: `Bearer ${token}`
    //     },
    // });

    // if (!response.ok) {
    //     throw new Error('Failed to fetch executive report');
    // }
    const request: AxiosRequestConfig = {
        method: 'get',
        url: `/api/reports/executive/${reportId}`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        responseType: 'blob' ,
    };
    const response = await handleRequest(request);
    return new Blob([response]);
}

export const fetchAndMatchReports = async (reportIds: number[]) => {
    try {
        if (reportIds.length > 0) {
            const fetchedReports = await fetchReports(reportIds);

            const token = localStorage.getItem('accessToken');

            const response = await axios.post('/api/conflicts/match', {
                listUploads: fetchedReports,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { matches, unmatchedList1, unmatchedList2 } = response.data;
            return { matches, unmatchedList1, unmatchedList2 };
        }
    } catch (error) {
        console.error('Error generating reports:', error);
        throw error;
    }
};

// Function to generate a report
export const generateReportRequest = async (finalReport: any[], name: string | undefined, type: string | null) => {
    try {
        const token = localStorage.getItem('accessToken');


        const request: AxiosRequestConfig = {
            method: 'post',
            url: '/api/uploads/generateReport',
            data: { finalReport, name, type },
            headers: { Authorization: `Bearer ${token}` },
        };
        return await handleRequest(request);
    } catch (error) {
        console.error('Error generating report:', error);
        throw error;
    }
};


// Invite Member
export const inviteMember = async (orgId: string, ownerId: string, email: string, accessToken: string) => {
    const request = {
        method: 'post',
        url: `/api/organizations/${ownerId}/invite`,
        data: { organizationId: orgId, username: email },
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};


// Fetch Invites
export const fetchInvites = async (username: string, accessToken: string) => {
    const request = {
        method: 'get',
        url: `/api/invites/${username}`,
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

// Accept Invite
export const acceptInvite = async (inviteId: string, accessToken: string) => {
    const request = {
        method: 'patch',
        url: `/api/invites/${inviteId}/accept`,
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};

// Reject Invite
export const rejectInvite = async (inviteId: string, accessToken: string) => {
    const request = {
        method: 'patch',
        url: `/api/invites/${inviteId}/reject`,
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};


//Get Organisation Owner Email
export const getOwner = async (orgId: string, accessToken: string) => {
    const request = {
        method: 'get',
        url: `/api/organizations/${orgId}/owner`,
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    return await handleRequest(request);
};
