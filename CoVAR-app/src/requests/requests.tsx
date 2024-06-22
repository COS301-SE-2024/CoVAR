import axios from 'axios';

export const getUserRole = async (accessToken : String) => {
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
