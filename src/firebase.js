// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { db } from "./firebase";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeDc72CruLXZBNHsvZbHvhiuihdPGMtKo",
  authDomain: "geoops-nigeria.firebaseapp.com",
  databaseURL: "https://geoops-nigeria-default-rtdb.firebaseio.com",
  projectId: "geoops-nigeria",
  storageBucket: "geoops-nigeria.firebasestorage.app",
  messagingSenderId: "975747707507",
  appId: "1:975747707507:web:4d051172c7867ed8347006",
  measurementId: "G-4VSEFP5VW9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

export { app };