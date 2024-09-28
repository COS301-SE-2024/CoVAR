'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Paper } from '@mui/material';
import { evaluateLaunchStyles, headingBoxStyles } from '../../../styles/evaluateStyle';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
  user_id: number;
  username: string;
  organization: string | null;
}

interface Organization {
  organization_id: number;
  name: string;
  owner: string;
}

const Evaluate: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true); // To manage loading state
  const router = useRouter();

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('/api/users/assigned_clients', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
        setLoading(false);
        console.log('Assigned users:', response.data);
      } catch (err) {
        console.error('Error fetching assigned users:', err);
        setLoading(false);
      }
    };

    const fetchAssignedOrganizations = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('/api/users/assigned_organizations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrganizations(response.data);
        setLoading(false);
        console.log('Assigned organizations:', response.data);
      } catch (err) {
        console.error('Error fetching assigned organizations:', err);
        setLoading(false);
      }
    };

    fetchAssignedUsers();
    fetchAssignedOrganizations();
  }, []);

  const handleUserButtonClick = (user: User) => {
    router.push(`/evaluate/user/${user.username}`);
  };

  const handleOrganizationButtonClick = (organization: Organization) => {
    router.push(`/evaluate/organization/${organization.name}`);
  };

  return (
    <Box sx={evaluateLaunchStyles}>
      {/* Heading Box */}
      <Box sx={headingBoxStyles}>
        <Typography variant="h4" sx={{ marginBottom: 2 }}>
          Assigned Clients and Organisations
        </Typography>
      </Box>
  
      {/* Container for scrolling */}
      <Box
        sx={{
          height: '80vh', // Controlled height
          overflowY: 'auto', // Vertical scroll enabled
          '&::-webkit-scrollbar': {
            width: '0.2vw', // Scrollbar width
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'gray', // Scrollbar color
            borderRadius: '0.4vw', // Rounded scrollbar edges
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent', // Scrollbar track color
          },
          scrollbarWidth: 'thin', // Firefox scrollbar width
          scrollbarColor: 'gray transparent', // Scrollbar color in Firefox
        }}
      >
        {/* Loading condition */}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : users.length === 0 && organizations.length === 0 ? (
          <Paper elevation={3} sx={{ marginBottom: 3, padding: 2 }}>
          <Typography>No assigned clients or organisations found.</Typography>
        </Paper>
        ) : (
          <List>
            {/* Each user wrapped in a standalone Paper component */}
            {users.map(user => (
              <Paper
                key={user.user_id}
                elevation={3}
                sx={{ marginBottom: 3, padding: 1 }}
              >
                <ListItem sx={{ borderRadius: 1 }}>
                  <ListItemText primary={`User: ${user.username}`} />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      onClick={() => handleUserButtonClick(user)}
                    >
                      Evaluate
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            ))}
  
            {/* Each organization wrapped in a standalone Paper component */}
            {organizations.map(org => (
              <Paper
                key={org.organization_id}
                elevation={3}
                sx={{ marginBottom: 3, padding: 1 }}
              >
                <ListItem sx={{ borderRadius: 1 }}>
                  <ListItemText primary={`Organisation: ${org.name}`} />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      onClick={() => handleOrganizationButtonClick(org)}
                    >
                      Evaluate
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
  
};

export default Evaluate;