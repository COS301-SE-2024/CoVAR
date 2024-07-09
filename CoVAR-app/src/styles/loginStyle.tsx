'use client'
import { SxProps } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button'; // Import MUI Button

// Existing styles
export const containerStyles: SxProps = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
};

export const boxStyles: SxProps = {
  textAlign: 'center',
  marginRight: 'auto',
  marginLeft: 'auto',
};

export const iconStyles: SxProps = {
  fontSize: 150,
  color: 'primary.main',
};

export const cardStyles: SxProps = {
  backgroundColor: '#2F3E46',
  padding: 4,
  borderRadius: 1,
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: '#CAD2C5',
};

export const textFieldStyles: SxProps = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#CAD2C5',
    },
    '&:hover fieldset': {
      borderColor: '#CAD2C5',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#52796F',
    },
  },
};

export const buttonStyles: SxProps = {
  mt: 3,
  mb: 2,
  backgroundColor: 'primary.main',
  color: 'white',
  '&:hover': {
    backgroundColor: 'primary.dark',
  },
};

export const linkStyles: SxProps = {
  color: 'text.secondary',
  ml: 1,
};

export const GoogleButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: '#4285F4',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 20px',
  borderRadius: 4,
  width: '100%', // Make the button full width
  maxWidth: '350px', // Optional: limit the maximum width
  '&:hover': {
    backgroundColor: '#357ae8',
  },
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));
