'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Paper } from '@mui/material';
import { evaluateLaunchStyles } from '../../../styles/evaluateStyle';
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
      <Typography variant="h6" sx={{ marginTop: 4 }}>
        Assigned Clients and Organisations
      </Typography>
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : users.length === 0 && organizations.length === 0 ? (
          <Typography>No assigned clients or organisations found.</Typography>
        ) : (
          <List>
            {users.map(user => (
              <ListItem key={user.user_id} sx={{ marginBottom: 1, padding: 1, borderRadius: 1, boxShadow: 1 }}>
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
            ))}
            {organizations.map(org => (
              <ListItem key={org.organization_id} sx={{ marginBottom: 1, padding: 1, borderRadius: 1, boxShadow: 1 }}>
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
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Evaluate;