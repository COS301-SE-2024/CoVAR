import { createTheme } from '@mui/material/styles';

// Light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#84A98C',
      dark: '#52796F',
    },
    background: {
      default: '#F0F4F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F282E',
      secondary: '#52796F',
    },
    action: {
      hover: '#E0E0E0',
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
    background: {
      default: '#1F282E',
      paper: '#1F282E',
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
          color: '#CAD2C5',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: '#CAD2C5',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4, // ensuring button border radius matches the theme
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: 8, // ensure all papers have consistent padding
        },
      },
    },
  },
});

export { lightTheme, darkTheme };
