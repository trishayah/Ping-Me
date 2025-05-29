// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOZrMKqjNfuwprBUPJ7LI0IHiOaeyRvHE",
  authDomain: "pingme-a6d2e.firebaseapp.com",
  projectId: "pingme-a6d2e",
  storageBucket: "pingme-a6d2e.firebasestorage.app",
  messagingSenderId: "775072380786",
  appId: "1:775072380786:web:2e79135c30555cf833cfeb",
  measurementId: "G-XC2V85QCBS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app as firebaseApp, db };