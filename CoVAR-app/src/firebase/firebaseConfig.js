// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

console.log("API Key:", process.env.REACT_APP_API_KEY);
console.log("Auth Domain:", process.env.REACT_APP_AUTH_DOMAIN);
console.log("Project ID:", process.env.REACT_APP_PROJECT_ID);
console.log("Storage Bucket:", process.env.REACT_APP_STORAGE_BUCKET);
console.log("Messaging Sender ID:", process.env.REACT_APP_MESSAGING_SENDER_ID);
console.log("App ID:", process.env.REACT_APP_APP_ID);
console.log("Measurement ID:", process.env.REACT_APP_MEASUREMENT_ID);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
