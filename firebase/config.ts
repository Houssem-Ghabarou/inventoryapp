// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPN7UzEgfy6zfbcnS0ibkzt_WO_5YDKsk",
  authDomain: "inventory-6aadb.firebaseapp.com",
  projectId: "inventory-6aadb",
  storageBucket: "inventory-6aadb.firebasestorage.app",
  messagingSenderId: "388301658663",
  appId: "1:388301658663:web:28e9c77790d49ea1f08c02",
  measurementId: "G-99SX88W2L8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
