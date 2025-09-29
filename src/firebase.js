// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBoIAV5F7W1_KO4oRLllGzZ8NMAnLZyqz0",
  authDomain: "tape2tape-2cd5f.firebaseapp.com",
  projectId: "tape2tape-2cd5f",
  storageBucket: "tape2tape-2cd5f.firebasestorage.app", // ✅ custom bucket
  messagingSenderId: "605479937024",
  appId: "1:605479937024:web:34b1b316ae0bf..." // <-- keep your full ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app, "gs://tape2tape-2cd5f.firebasestorage.app"); // ✅ override endpoint to match CORS

export { db, auth, storage };
