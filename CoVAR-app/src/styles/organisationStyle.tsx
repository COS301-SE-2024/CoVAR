import { SxProps } from '@mui/material/styles';

export const mainContentStyles: SxProps = {
    flexGrow: 1,
    backgroundColor: '#1F282E',
    padding: 3,
    color: '#CAD2C5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow : 'hidden',
};

export const cardStyles: SxProps = {
    width: 450,
    height: 220,
    backgroundColor: '#2F3E46',
    color: '#CAD2C5',
    padding: 2,
};

export const headingBoxStyles: SxProps = {
    backgroundColor: '#2D3E44',
    width: '98%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    marginBottom: 2,
};

export const textFieldStyles: SxProps = {
  color: '#CAD2C5',
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
