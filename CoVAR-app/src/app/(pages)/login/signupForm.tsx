'use client'

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
          getUserResponse = await axios.post(
            '/api/getUser',
            { accessToken: localStorage.getItem('accessToken') },
            { headers: { Authorization: `Bearer ${loginResponse.data.accessToken}` } }
          );
        } catch (error) {
          throw error; // Re-throw the error to be caught by the outer catch block
        }
        const { role } = getUserResponse.data;
        if (getUserResponse.status === 200) {
          if (role === "unauthorised") {
            router.replace('/lounge'); // Navigate to lounge if unauthorised
          } else {
            router.replace('/dashboard'); // Navigate to dashboard after successful login
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
          router.replace('/lounge'); // Navigate to lounge since a new user is unauthorised
      } else {
        throw new Error('Failed to create user in PostgreSQL');
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError('Email already in use.');
      } else {
        setError('Error signing up.');
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ textAlign: 'center', margin: '20px auto', width: '100%' }}>
          <Typography variant="h1" color="textPrimary" fontWeight={550} gutterBottom >
            CoVAR
          </Typography>
          <LockOutlinedIcon sx={{ fontSize: 150, color: theme.palette.secondary.main }} />
        </Box>
        <Card sx={{ backgroundColor: theme.palette.background.paper, padding: 4, borderRadius: 1, borderStyle: 'solid', borderWidth: 1, borderColor: theme.palette.divider }}>
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
                InputLabelProps={{ style: { color: theme.palette.text.primary } }}
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
                type="password"
                id="password"
                autoComplete="current-password"
                InputLabelProps={{ style: { color: theme.palette.text.primary } }}
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
                name="passwordConfirm"
                label="Confirm Password"
                type="password"
                id="passwordConfirm"
                autoComplete="current-password"
                InputLabelProps={{ style: { color: theme.palette.text.primary } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: theme.palette.divider },
                    '&:hover fieldset': { borderColor: theme.palette.divider },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
                }}
              />
              <Box sx={{ textAlign: 'left', width: '100%', mt: 1 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Use 8 or more characters with a mix of letters, numbers & symbols
                </Typography>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: theme.palette.primary.main }}
              >
                Sign Up
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: theme.palette.primary.main }}
                onClick={signInWithGoogle}
              >
                <GoogleIcon />Sign Up with Google
              </Button>
              <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  Already have an account?
                </Typography>
                <Link href="#" variant="body2" sx={{ color: theme.palette.text.secondary, ml: 1 }} onClick={toggleForm}>
                  Log in
                </Link>
              </Box>
              {error && (
                <Typography variant="body2" color="error" id="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Box>
          </Box>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default Signup;
