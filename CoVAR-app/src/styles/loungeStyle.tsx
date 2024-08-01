import { SxProps, Theme } from '@mui/material/styles';

export const loungeContainerStyles: SxProps<Theme> = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: (theme) => theme.palette.background.default,
};

export const loungeBoxStyles: SxProps<Theme> = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: (theme) => theme.spacing(3),
};

export const loungeHeadingStyles: SxProps<Theme> = {
    color: (theme) => theme.palette.text.primary,
    marginTop: 2,
};

export const loungeTextStyles: SxProps<Theme> = {
    color: (theme) => theme.palette.text.primary,
    textAlign: 'center',
};

export const brandTextStyles: SxProps<Theme> = {
    color: (theme) => theme.palette.text.primary,
    fontWeight: 550,
    margin: '20px 0',
};

export const iconStyles: SxProps<Theme> = {
    fontSize: 100,
    color: (theme) => theme.palette.primary.main,
    marginBottom: 1,
};

export const signOutButtonStyles: SxProps<Theme> = (theme) => ({
    marginTop: 'auto',
    width: '90%',
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText, 
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    borderRadius: 2,
  });
  