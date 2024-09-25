'use client';
import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Card, Container, CssBaseline, Link } from '@mui/material';
import { useTheme, ThemeProvider } from '@mui/material/styles';
import { doPasswordReset } from '../../../functions/firebase/auth';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {checkEmailExists} from '../../../functions/requests';

interface ForgotPasswordFormProps {
    toggleForm: (formType: 'login' | 'signup' | 'forgotPassword') => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const theme = useTheme();

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await checkEmailExists(email);
  
      await doPasswordReset(email);
      setSuccessMessage('A password reset link has been sent to your email.');
      setError('');
  
      setTimeout(() => {
        toggleForm('login'); // Redirect to login form
        setSuccessMessage('');
      }, 10000);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setError('No account found with this email address.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
      setSuccessMessage('');
  
      setTimeout(() => {
        setError('');
      }, 10000);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container 
        maxWidth="xl" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
        }}
      >
        <Box 
          sx={{ 
            textAlign: 'center', 
            marginRight: 'auto', 
            marginLeft: 'auto',
            width: '100vw', 
            height: '30vh', 
          }}
        >
          <Typography variant="h1" color="textPrimary" fontWeight={550} gutterBottom>
            CoVAR
          </Typography>
          <LockOutlinedIcon sx={{ fontSize: '15vh', color: theme.palette.primary.main }} />
        </Box>
        <Card 
          sx={{ 
            backgroundColor: theme.palette.background.paper, 
            padding: '3vh', 
            borderRadius: 1, 
            borderStyle: 'solid', 
            borderWidth: 1, 
            borderColor: theme.palette.divider,
            width: '50vw', 
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" component="h2" fontWeight={550} gutterBottom>
              Forgot Password
            </Typography>
            <Box component="form" sx={{ width: '100%', mt: '2vh' }} onSubmit={handlePasswordReset}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                InputLabelProps={{
                  style: { color: theme.palette.text.primary },
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  marginBottom: '2vh',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.divider,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
             
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: '2vh', mb: '2vh', backgroundColor: theme.palette.primary.main }}
              >
                Reset Password
              </Button>

              <Box sx={{ textAlign: 'center', width: '100%', mt: '1vh', mb: '1vh' }}>
                <Link href="#" variant="body2" sx={{ color: theme.palette.text.secondary }} onClick={() => toggleForm('login')}>
                  Back to Login
                </Link>
              </Box>
              
              <Box sx={{ width: '100%', minHeight: '2vh' }}>
                {error && (
                  <Typography variant="body2" color="error" textAlign="center">
                    {error}
                  </Typography>
                )}
                {successMessage && (
                  <Typography variant="body2" color="success.main" textAlign="center">
                    {successMessage}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default ForgotPasswordForm;
