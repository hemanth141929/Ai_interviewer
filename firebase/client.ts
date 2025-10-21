// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARENs0Vu3nI0G6zwtyKe-pOVTV3w5db4M",
  authDomain: "aiinterviewer-2fcb8.firebaseapp.com",
  projectId: "aiinterviewer-2fcb8",
  storageBucket: "aiinterviewer-2fcb8.firebasestorage.app",
  messagingSenderId: "104666146887",
  appId: "1:104666146887:web:88301c5171d1e260516962",
  measurementId: "G-4YL0WP2NE8"
};

// Initialize Firebase

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);