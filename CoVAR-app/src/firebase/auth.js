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
  return createUserWithEmailAndPassword(auth, email, password);
}

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
}

export const doSignInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export const doSignOut = () => {
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
