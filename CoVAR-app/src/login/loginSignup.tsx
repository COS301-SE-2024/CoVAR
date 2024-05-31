import React from "react";
import Signup from "./signupForm";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import GoogleIcon from "../icons/GoogleIcon";
import { GoogleButton } from '../styles/loginStyle'; // Import the styled button



const LoginSignup = () => {
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

  return (
    <div>
      <Signup />
      <GoogleButton onClick={signInWithGoogle}>
        <GoogleIcon /> Sign In with Google
      </GoogleButton>
    </div>
  );
};

export default LoginSignup;
