
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB6rJzFw7FwUP3MFveojRAUB7GuhAmGXHI",
  authDomain: "babu-sahab.firebaseapp.com",
  databaseURL: "https://babu-sahab-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "babu-sahab",
  storageBucket: "babu-sahab.firebasestorage.app",
  messagingSenderId: "544048344901",
  appId: "1:544048344901:web:c55e7d2faaba5c1cd8982c",
  measurementId: "G-1NDD8M4BJS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
