import React from 'react';
import { theme } from '../App';
import { ThemeProvider } from '@mui/material/styles';
import { Container, Box, Typography, TextField, Button, Link, CssBaseline, Card } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { createUserWithEmailAndPassword } from "firebase/auth";
import GoogleIcon from "../icons/GoogleIcon";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from '../firebase/firebaseConfig';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

const addUserToFirestore = async (user: User) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "",
      createdAt: new Date()
    };
    await setDoc(userRef, userData);
    console.log("User added to Firestore: ", user.uid);
  } catch (error) {
    console.error("Error adding user to Firestore: ", error);
  }
};

interface SignupProps {
  toggleForm: () => void;
}

const Signup: React.FC<SignupProps> = ({ toggleForm }) => {
  const signInWithGoogle = async () => {
    try {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleProvider);
      console.log(result.user);
      return result;
    } catch (error) {
      console.error(error);
      // Handle errors here
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Form submitted');
    const data = new FormData(event.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const passwordConfirm = data.get('passwordConfirm') as string;

    if (typeof email === 'string' && typeof password === 'string' && typeof passwordConfirm === 'string') {
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('Confirm Password:', passwordConfirm);

      if (password === passwordConfirm) {
        signUpWithEmail(email, password);
      } else {
        console.error('Passwords do not match.');
      }
    } else {
      console.error('Invalid form data');
    }
  };

  const signUpWithEmail = (email: string, password: string) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        addUserToFirestore(user as User);
      })
      .catch((error) => {
        console.error("Error signing up: ", error);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ textAlign: 'center', margin: '20px auto', width: '100%' }}>
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
              <TextField
                margin="normal"
                required
                fullWidth
                name="passwordConfirm"
                label="Confirm Password"
                type="password"
                id="passwordConfirm"
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
                <Typography variant="body2">
                  Use 8 or more characters with a mix of letters, numbers & symbols
                </Typography>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: 'primary.main' }}
              >
                Sign Up
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: 'primary.main' }}
                onClick={signInWithGoogle}
              ><GoogleIcon />Sign Up with Google
              </Button>
              <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                  Already have an account?
                </Typography>
                <Link href="#" variant="body2" sx={{ color: 'text.secondary', ml: 1 }} onClick={toggleForm}>
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

