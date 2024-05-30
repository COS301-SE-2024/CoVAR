import React from 'react';
import { theme } from './App';
import { ThemeProvider } from '@mui/material/styles';
import { Container, Box, Typography, TextField, Button, Link, CssBaseline, Card } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';


const Signup = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ textAlign: 'center', marginRight: 'auto', marginLeft: 'auto' }}>
          <Typography variant="h1" color="textPrimary" gutterBottom>
            CoVAR
          </Typography>
          <LockOutlinedIcon sx={{ fontSize: 150, color: 'primary.main' }} />
        </Box>
        <Card sx={{ backgroundColor: '#2F3E46', padding: 4, borderRadius: 1, borderStyle: 'solid', borderWidth: 1, borderColor: '#CAD2C5' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Sign Up
            </Typography>
            <Box component="form" sx={{ width: '100%', mt: 1 }}>
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
                  style: { color: '#CAD2C5' },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#CAD2C5',
                    },
                    '&:hover fieldset': {
                      borderColor: '#CAD2C5',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#52796F',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                InputLabelProps={{
                  style: { color: '#CAD2C5' },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#CAD2C5',
                    },
                    '&:hover fieldset': {
                      borderColor: '#CAD2C5',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#52796F',
                    },
                  },
                }}
              />
              <Box sx={{ textAlign: 'left', width: '100%', mt: 1 }}>
                <Link href="#" variant="body2" sx={{ color: 'text.secondary' }}>
                  Forgot your password?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: 'primary.main' }}
              >
                Log in
              </Button>
              <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                  Don't have an account?
                </Typography>
                <Link href="#" variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                  Sign up
                </Link>
              </Box>
            </Box>
          </Box>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default Signup;
