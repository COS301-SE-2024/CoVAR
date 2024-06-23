import { SxProps, Theme } from '@mui/system';

export const mainContentStyles: SxProps<Theme> = {
    flexGrow: 1,
    backgroundColor: (theme) => theme.palette.background.default,
    padding: (theme) => theme.spacing(3),
    color: (theme) => theme.palette.text.primary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
};

export const cardStyles: SxProps<Theme> = {
    width: 450,
    height: 220,
    backgroundColor: (theme) => theme.palette.background.paper,
    color: (theme) => theme.palette.text.secondary,
    padding: (theme) => theme.spacing(2),
};

export const headingBoxStyles: SxProps<Theme> = {
    width: '98%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: (theme) => theme.spacing(2),
    marginBottom: (theme) => theme.spacing(2),
};

export const textFieldStyles: SxProps<Theme> = {
    // '& .MuiOutlinedInput-root': {
    //     '& fieldset': {
    //         borderColor: (theme) => theme.palette.text.secondary,
    //     },
    //     '&:hover fieldset': {
    //         borderColor: (theme) => theme.palette.text.primary,
    //     },
    //     '&.Mui-focused fieldset': {
    //         borderColor: (theme) => theme.palette.primary.main,
    //     },
    // },
};

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
