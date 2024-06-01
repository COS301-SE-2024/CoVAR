import React from 'react';
import LoginSignup from './login/loginSignup';
import Dashboard from './dashboard/dashboard';
import AdminTools from './adminTools/adminTools';
import Evaluate from './evaluate/evaluate';
import Account from './account/account';
import Settings from './settings/settings';
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
          <Route path="/login" element={< LoginSignup />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/evaluate" element={<Evaluate />} />
          <Route path="/account" element={<Account />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin-tools" element={<AdminTools />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
export { theme };