import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../App';
import { ThemeProvider } from '@mui/material/styles';
import { Container, Box, Typography, TextField, Button, Link, CssBaseline, Card } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle } from '../firebase/auth';
import GoogleIcon from "../icons/GoogleIcon";
import { doc, setDoc ,getDoc} from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';

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
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      const result = await doSignInWithGoogle();
      if (result.user) {
        await addUserToFirestore(result.user as User); // Ensure to await Firestore addition
        navigate('/'); // Navigate to the home page
      }
    } catch (error) {
      console.error(error);
      // Handle errors here
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
      navigate('/'); // Navigate to the home page
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
                InputLabelProps={{ style: { color: '#CAD2C5' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#CAD2C5' },
                    '&:hover fieldset': { borderColor: '#CAD2C5' },
                    '&.Mui-focused fieldset': { borderColor: '#52796F' },
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
                InputLabelProps={{ style: { color: '#CAD2C5' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#CAD2C5' },
                    '&:hover fieldset': { borderColor: '#CAD2C5' },
                    '&.Mui-focused fieldset': { borderColor: '#52796F' },
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
                InputLabelProps={{ style: { color: '#CAD2C5' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#CAD2C5' },
                    '&:hover fieldset': { borderColor: '#CAD2C5' },
                    '&.Mui-focused fieldset': { borderColor: '#52796F' },
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
              >
                <GoogleIcon />Sign Up with Google
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
