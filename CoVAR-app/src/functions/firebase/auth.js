import { auth } from "./firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  updatePassword, 
  sendEmailVerification 
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = (email, password) => {
  try {
    return createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error creating user with email and password:', error);
    throw error; // Re-throw the error to be caught by the calling function
  }
}

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
}

export const doSignInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export const doSignOut = () => {
  //cookie removal 
  document.cookie = 'accessToken=; Max-Age=0';
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  return auth.signOut();
}

export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
}

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
}

export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser);
}
