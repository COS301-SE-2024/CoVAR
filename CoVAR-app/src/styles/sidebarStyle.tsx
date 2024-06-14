import { SxProps, Theme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

export const sidebarStyles: SxProps<Theme> = (theme) => ({
  width: 250,
  minWidth: 250,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  color: theme.palette.text.primary,
});

export const mainContentStyles: SxProps<Theme> = (theme) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
});

export const sidebarItemStyles: SxProps<Theme> = (theme) => ({
  width: '100%',
  color: theme.palette.text.primary, // Ensure text color is primary
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  borderRadius: theme.shape.borderRadius,
});

export const iconStyles: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.primary,
});

export const logoStyles: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
});

export const logoutButtonStyles: SxProps<Theme> = (theme) => ({
  marginTop: 'auto',
  marginBottom: theme.spacing(2),
  width: '90%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText, // Use contrast text color
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
});

export const GoogleButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: '#4285F4',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 20px',
  borderRadius: theme.shape.borderRadius,
  width: '100%',
  maxWidth: '350px',
  '&:hover': {
    backgroundColor: '#357ae8',
  },
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));
