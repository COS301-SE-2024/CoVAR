'use client'
import { SxProps, Theme } from '@mui/material/styles';

export const uploadBoxStyles: SxProps<Theme> = (theme) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  border: (theme: Theme) => `2px dotted ${theme.palette.text.secondary}`,
  textAlign: 'center',
  backgroundColor: (theme: Theme) => theme.palette.action.hover,
  cursor: 'pointer',
  marginTop: 2,
});

export const buttonStyles: SxProps<Theme> = {
  mt: 3,
  mb: 2,
  backgroundColor: (theme) => theme.palette.primary.main,
  color: (theme) => theme.palette.primary.contrastText,
  '&:hover': {
      backgroundColor: (theme) => theme.palette.primary.dark,
  },
  width: '100%',
};

export const headingBoxStyles: SxProps<Theme> = {
  width: '98%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: (theme) => theme.spacing(2),
  marginBottom: (theme) => theme.spacing(2),
};


export const uploadButtonStyles: SxProps<Theme> = (theme) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
});

export const mainContentStyles: SxProps<Theme> = {
  backgroundColor: (theme) => theme.palette.background.default,
  color: (theme) => theme.palette.text.primary,
};


export const boxStyles: SxProps<Theme> = {

  backgroundColor: (theme) => theme.palette.background.default,
  color: (theme) => theme.palette.text.primary,

};

export const evaluateLaunchStyles: SxProps<Theme> = (theme) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  color: (theme) => theme.palette.text.primary,
  padding: theme.spacing(3),
  overflowY: 'auto',
});

