import axios from 'axios';

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

export const fetchUsers = async (orgId: string, accessToken: string) => {
  try {
    const response = await axios.post(
      '/api/organizations/users',
      { org_id: orgId },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const usersList = response.data.map((user: any) => ({
      id: user.user_id,
      email: user.username,
      name: user.username.split('@')[0], // Assuming name is part of the email before @
      role: user.role,
      createdAt: user.createdAt // Adjust if necessary
    }));
    console.log("Users list:", usersList);
    return usersList;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const removeUser = async (orgId: string, ownerId: string, email: string, accessToken: string) => {
  try {
    const response = await axios.post(
      `/api/organizations/${ownerId}/remove_user`,
      {
        organizationId: orgId,
        username: email,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
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
      {
        organizationId: orgId,
        username: email,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
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
      {
        organizationId: orgId,
        OrgName: organisationName,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.status;
  } catch (error) {
    console.error('Error deleting organisation:', error);
    throw error;
  }
};

export const changeOrganisationName = async (orgId: string, organisationName: string, newName: string, accessToken: string) => {
  try {
    const response = await axios.patch(
      `/api/organizations/${orgId}/change_name`,
      {
        OrgName: organisationName,
        newName: newName,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.status;
  } catch (error) {
    console.error('Error changing organisation name:', error);
    throw error;
  }
};

export const createOrganisation = async (organisationName: string, username: string, accessToken: string) => {
  try {
    const response = await axios.post(
      '/api/organizations/create',
      {
        name: organisationName,
        username: username,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating organisation:', error);
    throw error;
  }
};
