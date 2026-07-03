import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDbJyX3f4EDzYEB8vFrjzQXXoBd3PW-VX0",
  authDomain: "voyagr-8717f.firebaseapp.com",
  projectId: "voyagr-8717f",
  storageBucket: "voyagr-8717f.firebasestorage.app",
  messagingSenderId: "251567945593",
  appId: "1:251567945593:web:efe5ce197499dfd17f21a8",
  measurementId: "G-YEBYS82F6X"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");