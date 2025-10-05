// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getDatabase } from "firebase/database"; // Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyAznKPAqx-C7eJi5Ye0H0Y_5kN6kddiX9c",
  authDomain: "film-ionic.firebaseapp.com",
  databaseURL: "https://film-ionic-default-rtdb.firebaseio.com", // ✅ URL Realtime DB
  projectId: "film-ionic",
  storageBucket: "film-ionic.appspot.com",
  messagingSenderId: "446352300009",
  appId: "1:446352300009:web:a9de1dd35390065a115d78"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app); // Realtime DB
export default app;
