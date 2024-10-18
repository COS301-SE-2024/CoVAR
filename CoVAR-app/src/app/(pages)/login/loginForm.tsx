'use client'
import React, { useState, useEffect } from 'react';
import { useTheme, ThemeProvider } from '@mui/material/styles';
import { Container, Box, Typography, TextField, Button, Link, CssBaseline, Card } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from "../../../assets/GoogleIcon";
import { doSignInWithEmailAndPassword, doSignInWithGoogle} from '../../../functions/firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '../../../functions/firebase/firebaseConfig';
import axios from 'axios';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';



interface LoginProps {
  toggleForm: (formType: 'login' | 'signup' | 'forgotPassword') => void;
}

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

const Login: React.FC<LoginProps> = ({ toggleForm }) => {
  const theme = useTheme(); 
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(''); 
      }, 5000); 

      return () => clearTimeout(timer); 
    }
  }, [error]);


  const handleClickShowPassword = () => setShowPassword(!showPassword);

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        const currentUser = await doSignInWithEmailAndPassword(email, password);
        console.log(currentUser);
        if (currentUser) {
          const firebaseToken = await currentUser.user.getIdToken();
          // console.log("firebaseToken");
          // console.log(firebaseToken);
  
          const response = await axios.post('/api/users/login', {
            firebaseToken,
            username: email
          });
          //console.log(response);
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          console.log("accessToken", response.data.accessToken);
          console.log("refreshToken", response.data.refreshToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
          axios.defaults.headers.post['Content-Type'] = 'application/json';
  
          let getUserResponse = await axios.post(
            '/api/getUser',
            { accessToken: localStorage.getItem('accessToken') },
            { headers: { Authorization: `Bearer ${response.data.accessToken}` } }
          );
          //set cookie for middleware 
          document.cookie = `accessToken=${response.data.accessToken}`;
          //Extract individual properties from getUserResponse.data
          const { user_id, username, role, organization_id } = getUserResponse.data;
          console.log("getUserResponse");
          // Log individual properties
          console.log("User ID:", user_id);
          console.log("Username:", username);
          console.log("Role:", role);
          console.log("Organization ID:", organization_id);

          if (role === "unauthorised") {
            router.replace('/lounge'); // Navigate to lounge if unauthorised
          } else {
            router.replace('/dashboard'); // Navigate to dashboard after successful login
          }

        } else {
          throw new Error('User not found in Firebase Auth');
        }
      } catch (error) {
        //console.error('login in with email error',error);
        setIsSigningIn(false);
        setError('Failed to sign in. Please check your credentials.');
      }
    }
  };
  
  

  const signInWithGoogle = async () => {
    console.log("THIS IS THE LOGIN GOOGLE BUTTON");
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        const result = await doSignInWithGoogle();
        await addUserToFirestore(result.user as User);
        console.log("User signed in with Google:", result.user);
  
        const { uid, email } = result.user;
        console.log("User UID:", uid);
        console.log("User Email:", email);
  
        const response = await axios.post('/api/users/create', {
          uid,
          email
        });
        console.log("Create user response:", response);
  
        const firebaseToken = await result.user.getIdToken();
        //console.log("Firebase Token:", firebaseToken);
  
        const LoginResponse = await axios.post('/api/users/login', {
          firebaseToken,
          username: email
        });
        console.log("Login response:", LoginResponse);
  
        localStorage.setItem('accessToken', LoginResponse.data.accessToken);
        localStorage.setItem('refreshToken', LoginResponse.data.refreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${LoginResponse.data.accessToken}`;
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        //set cookie for middleware 
        document.cookie = `accessToken=${response.data.accessToken}`;
        let getUserResponse;
        try {
          console.log("THIS IS THE LOGIN GOOGLE BUTTON");
          getUserResponse = await axios.post(
            '/api/getMeoutthefuckingSidebar',
            { accessToken: localStorage.getItem('accessToken') },
            { headers: { Authorization: `Bearer ${LoginResponse.data.accessToken}` } }
          );
          console.log("Get user response:", getUserResponse);
        } catch (error) {
          console.error("Error fetching user data:", error);
          throw error; // Re-throw the error to be caught by the outer catch block
        }
  
        const { user_id, username, role, organization_id } = getUserResponse.data;
        console.log("User ID:", user_id);
        console.log("Username:", username);
        console.log("Role:", role);
        console.log("Organization ID:", organization_id);
  
        if (response.status === 201 && LoginResponse.status === 201) {
          if (role === "unauthorised") {
            router.replace('/lounge'); // Navigate to lounge if unauthorised
          } else {
            router.replace('/dashboard'); // Navigate to dashboard after successful login
          }

        } else {
          throw new Error('Failed to create user in PostgreSQL');
        }
      } catch (error) {
        setIsSigningIn(false);
        setError('Failed to sign in with Google.');
      }
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
              Sign In
            </Typography>
            <Box component="form" sx={{ width: '100%', mt: '2vh' }} onSubmit={onSubmit}>
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
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                InputLabelProps={{
                  style: { color: theme.palette.text.primary },
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <Box sx={{ textAlign: 'left', width: '100%', mt: '1vh', mb: '2vh' }}>
                <Link href="#" variant="body2" sx={{ color: theme.palette.text.secondary }} onClick={() => toggleForm('forgotPassword')}>
                  Forgot your password?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: '2vh', mb: '2vh', backgroundColor: theme.palette.primary.main }}
              >
                Log in
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: '1vh', mb: '2vh', backgroundColor: theme.palette.primary.main }}
                onClick={signInWithGoogle}
              >
                <GoogleIcon />Continue with Google
              </Button>
              <Box display="flex" justifyContent="center" alignItems="center" mt="2vh" mb="2vh">
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  Don&apos;t have an account?
                </Typography>
                <Link href="#" variant="body2" id="signupToggle" sx={{ color: theme.palette.text.secondary, ml: 1 }} onClick={() => toggleForm('signup')}>
                  Sign up
                </Link>
              </Box>
              
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                width="100%" 
                sx={{ position: 'relative', mt: '2vh', minHeight: '2vh' }} 
              >
                {error && (
                <Typography variant="body2" color="error" textAlign="center">
                  {error}
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

export default Login;
