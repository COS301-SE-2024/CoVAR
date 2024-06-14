import { SxProps, Theme } from '@mui/material/styles';

export const evaluateContainerStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  height: '100vh',
  backgroundColor: theme.palette.background.default, // Use theme's background color
});

export const uploadBoxStyles: SxProps<Theme> = (theme) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper, // Use theme's paper background color
  padding: theme.spacing(3), // Use theme's spacing
});

export const uploadButtonStyles: SxProps<Theme> = (theme) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.primary.main, // Use theme's primary color
  color: theme.palette.primary.contrastText, // Use theme's primary contrast text color
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark, // Use theme's dark primary color
  },
});
