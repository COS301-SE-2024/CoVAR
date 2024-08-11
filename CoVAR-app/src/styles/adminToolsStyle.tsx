'use client'
import { SxProps } from '@mui/material/styles';
import { Theme } from '@mui/system';


export const adminToolsContainerStyles: SxProps = {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#1F282E',
  };
  
  export const dataGridStyles = {
    height: '90vh',
    flex: '1 auto',
    fontWeight: 500,
    borderColor: 'text.primary',
    '& .MuiDataGrid-columnHeaderTitle': {
        color: 'text.primary',
    },
    '& .MuiDataGrid-columnSeparator': {
        color: 'text.primary',
    },
    '& .MuiDataGrid-cell': {
        color: 'text.primary',
        borderColor: 'text.primary',
    },
    '& .MuiDataGrid-footerContainer': {
        backgroundColor: 'background.paper',
        color: 'text.primary',
    },
    '& .MuiTablePagination-root': {
        color: 'text.primary',
    },
    '& .MuiSvgIcon-root': {
        color: 'text.primary',
    },
    '& .MuiDataGrid-toolbarContainer button': {
        color: 'text.primary',
    },
    '& .MuiDataGrid-topContainer, & .MuiDataGrid-container--top': {
        backgroundColor: 'primary.main',
    },
    '& .MuiDataGrid-overlay': {
        backgroundColor: 'background.default',
        color: 'text.primary',
    },
    '& .MuiDataGrid-filler': {
        backgroundColor: 'background.default',
        color: 'text.primary',
    },
    '& .MuiDataGrid-scrollbarFiller': {
        backgroundColor: 'background.paper',
    },
    '& .MuiDataGrid-scrollbarFiller--header': {
        backgroundColor: 'background.paper',
    },
    '& .MuiDataGrid-columnHeader': {
        backgroundColor: 'background.paper',
        color: 'text.primary',
    },
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

export const dialogStyles: SxProps<Theme> = {
    '& .MuiDialog-paper': {
        width: '45vw',
        height: '29vh',
        backgroundColor: (theme) => theme.palette.background.paper,
        color: (theme) => theme.palette.text.primary,
        overflow: 'hidden',
    },
};