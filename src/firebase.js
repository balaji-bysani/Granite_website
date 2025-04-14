import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBhB-jweqX1b8fyF2hfPoeyMJJwWNULQ2c",
    authDomain: "granite-website-98b41.firebaseapp.com",
    projectId: "granite-website-98b41",
    storageBucket: "granite-website-98b41.firebasestorage.app",
    messagingSenderId: "416823841995",
    appId: "1:416823841995:web:1b3fc9b2246a3b82daf74e",
    measurementId: "G-TEMK625V2Q"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();