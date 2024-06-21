import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, ThemeProvider } from '@mui/material/styles';
import { Container, Box, Typography, TextField, Button, Link, CssBaseline, Card } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle } from '../firebase/auth';
import GoogleIcon from "../icons/GoogleIcon";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import axios from 'axios';
const { v4: uuidv4, validate: uuidValidate } = require('uuid');

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

const addUserToFirestore = async (user: User) => {
  try {
    const userRef = doc(db, "user", user.uid); 
    const userSnapshot = await getDoc(userRef); // Check if the document exists

    if (!userSnapshot.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "",
        createdAt: new Date(),
        role: "client"
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
  const theme = useTheme(); // Use the theme hook here
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      const result = await doSignInWithGoogle();
      if (result.user) {
        const { uid, email, displayName } = result.user;
        await addUserToFirestore(result.user as User); // Ensure to await Firestore addition
        // Send user data to backend
        const response = await axios.post('/api/users/create', {
          uid,
          email
      });

      if (response.status === 201) {
          navigate('/');
      } else {
          throw new Error('Failed to create user in PostgreSQL');
      }
  }
} catch (error) {
  console.error(error);
  // Handle errors here
}
  };
  // Testing the test route
const testRoute = async () => {
  try {
      const response = await axios.get('/api/test');
      console.log(response.data);
  } catch (error) {
      console.error('Error testing route:', error);
  }
};
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const passwordConfirm = data.get('passwordConfirm') as string;

    if (password !== passwordConfirm) {
      console.error('Passwords do not match.');
      return;
    }

    try {
      const userCredential = await doCreateUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      await addUserToFirestore(user as User); // Ensure to await Firestore addition
      // Send user data to backend
      const response = await axios.post('/api/users/create', {
        uid: user.uid,
        email: user.email
      });

      if (response.status === 201) {
        navigate('/'); // Navigate to the home page after successful signup
      } else {
        throw new Error('Failed to create user in PostgreSQL');
      }
    } catch (error) {
      console.error("Error signing up: ", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ textAlign: 'center', margin: '20px auto', width: '100%' }}>
          <Typography variant="h1" color="textPrimary" gutterBottom>
            CoVAR
          </Typography>
          <LockOutlinedIcon sx={{ fontSize: 150, color: theme.palette.primary.main }} />
        </Box>
        <Card sx={{ backgroundColor: theme.palette.background.paper, padding: 4, borderRadius: 1, borderStyle: 'solid', borderWidth: 1, borderColor: theme.palette.divider }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom>
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
            </Box>
          </Box>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default Signup;
