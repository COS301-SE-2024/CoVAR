import React from 'react';
import LoginSignup from './login/loginSignup';
import Dashboard from './dashboard/dashboard';
import AdminTools from './adminTools/adminTools';
import Evaluate from './evaluate/evaluate';
import Account from './account/account';
import Settings from './settings/settings';
import { createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './layout/layout'; // adjust the path as necessary

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
        <Routes>
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/evaluate" element={<Layout><Evaluate /></Layout>} />
          <Route path="/account" element={<Layout><Account /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/admin-tools" element={<Layout><AdminTools /></Layout>} />
        </Routes>
      </Router>
    );
  };
  

export default App;
export { theme };