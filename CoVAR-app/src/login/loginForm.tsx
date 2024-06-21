import React, { useEffect } from 'react';
import { useTheme, ThemeProvider } from '@mui/material/styles';
import { Container, Box, Typography, TextField, Button, Link, CssBaseline, Card } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from "../icons/GoogleIcon";
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../firebase/auth';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';
import axios from 'axios';

interface LoginProps {
  toggleForm: () => void;
}

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

const Login: React.FC<LoginProps> = ({ toggleForm }) => {
  const theme = useTheme(); // Use the theme hook here
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  useEffect(() => {
    if (userLoggedIn) {
      navigate('/');
    }
  }, [userLoggedIn, navigate]);

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithEmailAndPassword(email, password);
        navigate('/'); // Navigate to dashboard after successful login
      } catch (error) {
        console.error(error);
        setIsSigningIn(false);
        setError('Failed to sign in. Please check your credentials.');
      }
    }
  };

  const signInWithGoogle = async () => {
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        const result = await doSignInWithGoogle();
        await addUserToFirestore(result.user as User); // Ensure to await Firestore addition
        console.log(result.user);
        //call to postgresql to check if user exists else make one and then navigate
        const { uid, email, displayName } = result.user;
        const response = await axios.post('/api/users/create', {
          uid,
          email
        });

        if (response.status === 201) {
            navigate('/');
        } else {
            throw new Error('Failed to create user in PostgreSQL');
        }
        return result;
      } catch (error) {
        console.error(error);
        setIsSigningIn(false);
        setError('Failed to sign in with Google.');
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ textAlign: 'center', marginRight: 'auto', marginLeft: 'auto' }}>
          <Typography variant="h1" color="textPrimary" gutterBottom>
            CoVAR
          </Typography>
          <LockOutlinedIcon sx={{ fontSize: 150, color: theme.palette.primary.main }} />
        </Box>
        <Card sx={{ backgroundColor: theme.palette.background.paper, padding: 4, borderRadius: 1, borderStyle: 'solid', borderWidth: 1, borderColor: theme.palette.divider }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Sign In
            </Typography>
            <Box component="form" sx={{ width: '100%', mt: 1 }} onSubmit={onSubmit}>
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
                  style: { color: theme.palette.text.primary },
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
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
              <Box sx={{ textAlign: 'left', width: '100%', mt: 1 }}>
                <Link href="#" variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Forgot your password?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: theme.palette.primary.main }}
              >
                Log in
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: theme.palette.primary.main }}
                onClick={signInWithGoogle}
              >
                <GoogleIcon />Continue with Google
              </Button>
              <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  Don't have an account?
                </Typography>
                <Link href="#" variant="body2" sx={{ color: theme.palette.text.secondary, ml: 1 }} onClick={toggleForm}>
                  Sign up
                </Link>
              </Box>
              {error && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
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

export default Login;
