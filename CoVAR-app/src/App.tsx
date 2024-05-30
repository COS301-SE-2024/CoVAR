import React from 'react';
import LoginSignup from './loginSignup';
import { createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#52796F',
    },
    background: {
      default: '#1F282E',
      paper: '#1F282E',
    },
    text: {
      primary: '#CAD2C5',
      secondary: '#84A98C',
    },
  },
  typography: {
    fontFamily: 'Urbanist, Arial, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
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
  },
});

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/loginSignup" element={< LoginSignup />} />
          <Route path="/" element={<h2>Home Page</h2>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
export { theme };