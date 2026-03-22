// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDKvacROTxO-a2Ax-pd1owsTOj3k9HEHF8",
  authDomain: "mybookshelf-ed089.firebaseapp.com",
  projectId: "mybookshelf-ed089",
  storageBucket: "mybookshelf-ed089.firebasestorage.app",
  messagingSenderId: "499076779814",
  appId: "1:499076779814:web:a146aaaf277db126de7be7"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);


export const functions = getFunctions(app);


if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}