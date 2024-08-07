'use client'
import { SxProps, Theme } from '@mui/material/styles';

export const uploadBoxStyles: SxProps<Theme> = (theme) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
});

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

export const evaluateLaunchStyles: SxProps<Theme> = (theme) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  color: (theme) => theme.palette.text.primary,
  padding: theme.spacing(3),
  overflowY: 'auto',
});