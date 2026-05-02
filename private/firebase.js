// Firebase initialization (v12 modular CDN)
// Replace the config below with YOUR Firebase project's web config.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, addDoc,
  collection, query, where, orderBy, onSnapshot, serverTimestamp, getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
  getStorage, ref as sRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// TODO: Replace with your actual Firebase project config
export const firebaseConfig = {
  apiKey: "AIzaSyBjs0a4aelsMMqYAQxFch6pxYB0tkJLfGE",
  authDomain: "mariki-3497a.firebaseapp.com",
  projectId: "mariki-3497a",
  storageBucket: "mariki-3497a.firebasestorage.app",
  messagingSenderId: "407565484293",
  appId: "1:407565484293:web:b3717da3a5af987056f76c"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, updateProfile,
  doc, setDoc, getDoc, updateDoc, deleteDoc, addDoc,
  collection, query, where, orderBy, onSnapshot, serverTimestamp, getDocs,
  sRef, uploadBytes, getDownloadURL
};
