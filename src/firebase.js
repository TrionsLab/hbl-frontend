
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDNzcduPw4Ype-l5oOAzeicCvrMxH-ymtA",
  authDomain: "fir-auth-68052.firebaseapp.com",
  projectId: "fir-auth-68052",
  storageBucket: "fir-auth-68052.appspot.com",
  messagingSenderId: "809505651695",
  appId: "1:809505651695:web:603aa815ffe2363ee3d41a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();