import { createTheme } from '@mui/material/styles';

// Light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#52796F',
      dark: '#3d5b53',
    },
    secondary: {
      main: '#52796F',
    },
    background: {
      default: '#CED4DA',
      paper: '#F8F9FA',
    },
    text: {
      primary: '#212529',
      secondary: '#343A40',
    },
    action: {
      hover: '#DEDEDE',
    },
  },
  typography: {
    fontFamily: 'Urbanist, Arial, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: '#1F282E',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: '#1F282E',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: 8,
        },
      },
    },
  },
});

// Dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#52796F',
      dark: '#405d51',
    },
    secondary: {
      main: '#52796F',
    },
    background: {
      default: '#1F282E',
      paper: '#2D3E44',
    },
    text: {
      primary: '#CAD2C5',
      secondary: '#84A98C',
    },
    action: {
      hover: '#37474f',
    },
  },
  typography: {
    fontFamily: 'Urbanist, Arial, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: '#',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: '#',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4, 
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: 8, 
        },
      },
    },
  },
});

export { lightTheme, darkTheme };
