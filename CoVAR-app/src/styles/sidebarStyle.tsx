import { SxProps } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';


export const sidebarStyles: SxProps = {
  width: 250,
  backgroundColor: '#2D3E44',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: 3,
  paddingBottom: 3,
};

export const mainContentStyles: SxProps = {
  flexGrow: 1,
  backgroundColor: '#1F282E',
  padding: 3,
};

export const sidebarItemStyles: SxProps = {
  width: '100%',
  color: '#CAD2C5',
  '&:hover': {
    backgroundColor: '#3E4E56',
  },
  borderRadius: 1,
};

export const iconStyles: SxProps = {
  color: '#CAD2C5',
};

export const logoStyles: SxProps = {
  color: '#CAD2C5',
  marginBottom: 2,
};

export const logoutButtonStyles: SxProps = {
  marginTop: 'auto',
  marginBottom: 2,
  width: '90%',
  backgroundColor: '#52796F',
  color: '#CAD2C5',
  '&:hover': {
    backgroundColor: '#435B60',
  },
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
  width: '100%',
  maxWidth: '350px',
  '&:hover': {
    backgroundColor: '#357ae8',
  },
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));