import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginSignup from './login/loginSignup';
import Dashboard from './dashboard/dashboard';
import AdminTools from './adminTools/adminTools';
import Evaluate from './evaluate/evaluate';
import Account from './account/account';
import Settings from './settings/settings';
import Organisation from './organisation/organisation'; 
import Layout from './layout/layout'; 
import { CustomThemeProvider } from './styles/customThemeProvider';
import Help from './help/help';



const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <Router>
        
          <Routes>
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/evaluate" element={<Layout><Evaluate /></Layout>} />
            <Route path="/account" element={<Layout><Account /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            <Route path="/admin-tools" element={<Layout><AdminTools /></Layout>} />
            <Route path="/organisation" element={<Layout><Organisation /></Layout>} /> 
            <Route path="/help" element={<Layout><Help /></Layout>} />
          </Routes>
      </Router>
    </CustomThemeProvider>
  );
};

export default App;


