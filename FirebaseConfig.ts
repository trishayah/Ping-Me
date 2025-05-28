// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOZrMKqjNfuwprBUPJ7LI0IHiOaeyRvHE",
  authDomain: "pingme-a6d2e.firebaseapp.com",
  projectId: "pingme-a6d2e",
  storageBucket: "pingme-a6d2e.firebasestorage.app",
  messagingSenderId: "775072380786",
  appId: "1:775072380786:web:90f6f17e28c2f7a833cfeb",
  measurementId: "G-5EHJH6FLWC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})