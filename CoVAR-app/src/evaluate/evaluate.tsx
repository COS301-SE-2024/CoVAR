import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Paper } from '@mui/material';
import { mainContentStyles } from '../styles/sidebarStyle';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const response = await axios.get('/api/users/assigned_clients');
        setUsers(response.data);
        console.log('Assigned users:', response.data);
      } catch (err) {
        console.error('Error fetching assigned users:', err);
      }
    };

    const fetchAssignedOrganizations = async () => {
      try {
        const response = await axios.get('/api/users/assigned_organizations');
        setOrganizations(response.data);
        console.log('Assigned organizations:', response.data);
      } catch (err) {
        console.error('Error fetching assigned organizations:', err);
      }
    };

    fetchAssignedUsers();
    fetchAssignedOrganizations();
  }, []);

 

  const handleUserButtonClick = (user: User) => {
    navigate(`/evaluate/user/${user.username}`);
  };

  const handleOrganizationButtonClick = (organization: Organization) => {
    navigate(`/evaluate/organization/${organization.name}`);
  };

  return (
    <Box sx={mainContentStyles}>
      
      <Typography variant="h6" sx={{ marginTop: 4 }}>
        Assigned Clients and Organizations
      </Typography>
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
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
              <ListItemText primary={`Organization: ${org.name}`} />
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
      </Paper>
    </Box>
  );
};

export default Evaluate;
