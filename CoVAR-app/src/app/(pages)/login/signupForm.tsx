'use client';

import React, { useState } from 'react';
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
  toggleForm: () => void;
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
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    setIsValidPassword(passwordRegex.test(password));
  };

  const validatePasswordMatch = (password: string, confirm: string) => {
    setDoPasswordsMatch(password === confirm);
  };

  const signInWithGoogle = async () => {
    // Your Google sign-in logic here
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidPassword || !doPasswordsMatch || emailError) {
      setError('Please correct the errors before submitting.');
      return;
    }
    
    // Your user creation logic here
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ textAlign: 'center', margin: '20px auto', width: '100%' }}>
          <Typography variant="h1" color="textPrimary" fontWeight={550} gutterBottom>
            CoVAR
          </Typography>
          <LockOutlinedIcon sx={{ fontSize: 150, color: theme.palette.secondary.main }} />
        </Box>
        <Card sx={{ backgroundColor: theme.palette.background.paper, padding: 4, borderRadius: 1, borderStyle: 'solid', borderWidth: 1, borderColor: theme.palette.divider, maxWidth: '550px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" component="h2" fontWeight={550} gutterBottom>
              Sign Up
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
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
                    '& fieldset': { borderColor: theme.palette.divider },
                    '&:hover fieldset': { borderColor: theme.palette.divider },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
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
                InputLabelProps={{ style: { color: theme.palette.text.primary } }}
                error={!isValidPassword}
                helperText={!isValidPassword && "Password must be at least 8 characters and include letters, numbers, and symbols."}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: !isValidPassword ? theme.palette.error.main : theme.palette.divider },
                    '&:hover fieldset': { borderColor: !isValidPassword ? theme.palette.error.main : theme.palette.divider },
                    '&.Mui-focused fieldset': { borderColor: isValidPassword ? theme.palette.primary.main : theme.palette.error.main },
                  },
                  '& .MuiFormHelperText-root': {
                    marginTop: 1, // Prevent overlap with TextField
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ?  <Visibility /> : <VisibilityOff />}
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
                InputLabelProps={{ style: { color: theme.palette.text.primary } }}
                error={!doPasswordsMatch}
                helperText={!doPasswordsMatch && "Passwords do not match."}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: !doPasswordsMatch ? theme.palette.error.main : theme.palette.divider },
                    '&:hover fieldset': { borderColor: !doPasswordsMatch ? theme.palette.error.main : theme.palette.divider },
                    '&.Mui-focused fieldset': { borderColor: doPasswordsMatch ? theme.palette.primary.main : theme.palette.error.main },
                  },
                  '& .MuiFormHelperText-root': {
                    marginTop: 1, 
                  },
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
                sx={{ mt: 3, mb: 2, backgroundColor: theme.palette.primary.main }}
                disabled={!isValidPassword || !doPasswordsMatch || !!emailError}
              >
                Sign Up
              </Button>
              {error && (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<GoogleIcon />}
                sx={{ mt: 1, mb: 2 }}
                onClick={signInWithGoogle}
              >
                Sign Up with Google
              </Button>
              <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  Already have an account?
                </Typography>
                <Link href="#" variant="body2" id="link" onClick={toggleForm} sx={{ cursor: 'pointer', ml: 1 }}>
                  Sign In
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
