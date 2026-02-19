import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "APNAR_NEW_API_KEY",
  authDomain: "babu-sahab.firebaseapp.com",
  projectId: "babu-sahab",
  storageBucket: "babu-sahab.firebasestorage.app",
  messagingSenderId: "544048344901",
  appId: "1:544048344901:web:c55e7d2faaba5c1cd8982c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
