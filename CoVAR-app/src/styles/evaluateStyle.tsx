import { SxProps } from '@mui/material/styles';

export const evaluateContainerStyles: SxProps = {
  display: 'flex',
  height: '100vh',
  backgroundColor: '#1F282E',
};

export const uploadBoxStyles: SxProps = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#2D3E44',
  padding: 3,
};

export const uploadButtonStyles: SxProps = {
  marginTop: 3,
  marginBottom: 2,
  backgroundColor: '#52796F',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 20px',
  borderRadius: 1,
  '&:hover': {
    backgroundColor: '#84A98C',
  },
};
