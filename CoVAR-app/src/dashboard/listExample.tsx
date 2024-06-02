import React from 'react';
import { List, ListItem, ListItemText, Box } from '@mui/material';

const ListExample: React.FC = () => {
  return (
    <Box>
      <List>
        <ListItem>
          <ListItemText primary="Item 1" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Item 2" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Item 3" />
        </ListItem>
      </List>
    </Box>
  );
};

export default ListExample;
