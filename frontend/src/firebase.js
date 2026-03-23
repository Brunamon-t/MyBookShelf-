import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDKvacROTxO-a2Ax-pd1owsTOj3k9HEHF8",
  authDomain: "mybookshelf-ed089.firebaseapp.com",
  projectId: "mybookshelf-ed089",
  storageBucket: "mybookshelf-ed089.firebasestorage.app",
  messagingSenderId: "499076779814",
  appId: "1:499076779814:web:a146aaaf277db126de7be7"
};

<<<<<<< HEAD

=======
>>>>>>> c8c1be6
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const functions = getFunctions(app);

<<<<<<< HEAD

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);


export const functions = getFunctions(app);


if (window.location.hostname === "localhost") {
=======
// Para autenticação de origem (prod / cloud), não usar emulador por omissão.
// Caso realmente queiras usar emuladores locais, define a var de ambiente REACT_APP_FIREBASE_EMULATOR=true
if (process.env.REACT_APP_FIREBASE_EMULATOR === "true") {
  console.info("Firebase emulators ativados");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
>>>>>>> c8c1be6
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
} else {
  console.info("Usando Firebase remoto (origem) para Auth/Firestore/Functions");
}


export { auth, provider, db, functions };