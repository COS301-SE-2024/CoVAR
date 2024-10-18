'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme, ThemeProvider } from '@mui/material/styles';
import { Container, Box, Typography, TextField, Button, Link, CssBaseline, Card } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from "../../../assets/GoogleIcon";
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle } from '../../../functions/firebase/auth';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '../../../functions/firebase/firebaseConfig';
import axios from 'axios';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

const addUserToFirestore = async (user: User) => {
  try {
    const userRef = doc(db, "user", user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "",
        createdAt: new Date(),
        role: "unauthorised"
      };
      await setDoc(userRef, userData);
      console.log("User added to Firestore: ", user.uid);
    } else {
      console.log("User already exists in Firestore: ", user.uid);
    }
  } catch (error) {
    console.error("Error adding user to Firestore: ", error);
  }
};

interface SignupProps {
  toggleForm: (formType: 'login' | 'signup' | 'forgotPassword') => void;
}

const Signup: React.FC<SignupProps> = ({ toggleForm }) => {
  const theme = useTheme();
  const router = useRouter();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(true);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleClickShowPasswordConfirm = () => setShowPasswordConfirm((prev) => !prev);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    validatePasswordMatch(newPassword, passwordConfirm);
  };

  const handlePasswordConfirmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPasswordConfirm = event.target.value;
    setPasswordConfirm(newPasswordConfirm);
    validatePasswordMatch(password, newPasswordConfirm);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(emailRegex.test(email) ? '' : 'Invalid email address.');
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?.&])[A-Za-z\d@$!%*#?.]{8,}$/;
    setIsValidPassword(passwordRegex.test(password));
  };

  const validatePasswordMatch = (password: string, confirm: string) => {
    setDoPasswordsMatch(password === confirm);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await doSignInWithGoogle();
      if (result.user) {
        const { uid, email } = result.user;
        await addUserToFirestore(result.user as User);
        const response = await axios.post('/api/users/create', { uid, email });
        const firebaseToken = await result.user.getIdToken();

        const loginResponse = await axios.post('/api/users/login', {
          firebaseToken,
          username: email
        });

        localStorage.setItem('accessToken', loginResponse.data.accessToken);
        localStorage.setItem('refreshToken', loginResponse.data.refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.accessToken}`;
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        document.cookie = `accessToken=${response.data.accessToken}`;
        let getUserResponse;
        try {
          console.log("unauth req");
          getUserResponse = await axios.post(
            '/api/UnauthgetUser',
            { accessToken: localStorage.getItem('accessToken') },
            { headers: { Authorization: `Bearer ${loginResponse.data.accessToken}` } }
          );
        } catch (error) {
          console.log("unauth error");
          throw error;
        }
        const { role } = getUserResponse.data;
        if (getUserResponse.status === 200) {
          if (role === "unauthorised") {
            router.replace('/lounge');
          } else {
            router.replace('/dashboard');
          }
        } else {
          throw new Error('Failed to create user in PostgreSQL');
        }
      }
    } catch (error) {
      setError('Error signing in with Google.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const passwordConfirm = data.get('passwordConfirm') as string;

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const userCredential = await doCreateUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      await addUserToFirestore(user as User);
      const response = await axios.post('/api/users/create', { uid: user.uid, email: user.email });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      document.cookie = `accessToken=${response.data.accessToken}`;
      if (response.status === 201) {
        router.replace('/lounge');
      } else {
        throw new Error('Failed to create user in PostgreSQL');
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError('Email is already in use. Please use a different email address.');
      } else {
        setError('Error signing up. Please try again.');
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ textAlign: 'center', marginRight: 'auto', marginLeft: 'auto', width: '100vw', height: '30vh' }}>
          <Typography variant="h1" color="textPrimary" fontWeight={550} gutterBottom>
            CoVAR
          </Typography>
          <LockOutlinedIcon sx={{ fontSize: '15vh', color: theme.palette.secondary.main }} />
        </Box>
        <Card sx={{ backgroundColor: theme.palette.background.paper, padding: '3vh', borderRadius: 1, borderStyle: 'solid', borderWidth: 1, borderColor: theme.palette.divider, width: '50vw' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" component="h2" fontWeight={550} gutterBottom>
              Sign Up
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: '2vh' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleEmailChange}
                InputLabelProps={{ style: { color: theme.palette.text.primary } }}
                error={!!emailError}
                helperText={emailError}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { 
                      borderColor: theme.palette.divider 
                    },
                    '&:hover fieldset': { 
                      borderColor: theme.palette.divider 
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: theme.palette.primary.main 
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    position: 'absolute',
                    bottom: '-2.31vh',
                    left: 0,
                    color: theme.palette.error.main,
                    marginTop: 0,
                  },
                  marginBottom: 4, 
                }}
              />
  
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                InputLabelProps={{ 
                  style: { color: theme.palette.text.primary } 
                }}
                error={!isValidPassword}
                helperText={!isValidPassword && "Password must be at least 8 characters and include letters, numbers, and symbols."}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { 
                      borderColor: !isValidPassword ? theme.palette.error.main : theme.palette.divider 
                    },
                    '&:hover fieldset': { 
                      borderColor: !isValidPassword ? theme.palette.error.main : theme.palette.divider 
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: isValidPassword ? theme.palette.primary.main : theme.palette.error.main 
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    position: 'absolute',
                    bottom: '-4.1vh',
                    left: 0,
                    color: theme.palette.error.main,
                    marginTop: 0,
                  },
                  marginBottom: 4, 
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
  
              <TextField
                margin="normal"
                required
                fullWidth
                name="passwordConfirm"
                label="Confirm Password"
                type={showPasswordConfirm ? 'text' : 'password'}
                id="passwordConfirm"
                autoComplete="current-password"
                value={passwordConfirm}
                onChange={handlePasswordConfirmChange}
                InputLabelProps={{ 
                  style: { color: theme.palette.text.primary } 
                }}
                error={!doPasswordsMatch}
                helperText={!doPasswordsMatch && "Passwords do not match."}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { 
                      borderColor: !doPasswordsMatch ? theme.palette.error.main : theme.palette.divider 
                    },
                    '&:hover fieldset': { 
                      borderColor: !doPasswordsMatch ? theme.palette.error.main : theme.palette.divider 
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: doPasswordsMatch ? theme.palette.primary.main : theme.palette.error.main 
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    position: 'absolute',
                    bottom: '-2.31vh',
                    left: 0,
                    color: theme.palette.error.main,
                    marginTop: 0,
                  },
                  marginBottom: 4, 
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowPasswordConfirm}
                        edge="end"
                      >
                        {showPasswordConfirm ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 3, 
                  backgroundColor: theme.palette.primary.main 
                }}
                disabled={!isValidPassword || !doPasswordsMatch || !!emailError}
              >
                Sign Up
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<GoogleIcon />}
                sx={{ 
                  mt: 1, 
                  mb: 3 
                }}
                onClick={signInWithGoogle}
              >
                Sign Up with Google
              </Button>
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                mt={2} 
                mb={2}
              >
                <Typography 
                  variant="body2" 
                  sx={{ color: theme.palette.text.primary }}
                >
                  Already have an account?
                </Typography>
                <Link 
                  href="#" 
                  variant="body2" 
                  id="link" 
                  onClick={() => toggleForm('login')} 
                  sx={{ 
                    cursor: 'pointer', 
                    ml: 1 
                  }}
                >
                  Sign In
                </Link>
              </Box>
              <Box 
                sx={{ 
                  position: 'relative', 
                  width: '100%' 
                }}
              >
                {error && (
                  <Box 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center" 
                    width="100%" 
                    sx={{ 
                      position: 'absolute', 
                      top: '110%', 
                      left: 0 
                    }} 
                  >
                    <Typography 
                      variant="body2" 
                      color="error" 
                      textAlign="center"
                    >
                      {error}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Card>
      </Container>
    </ThemeProvider>
  );
  

  
  

};

export default Signup;
