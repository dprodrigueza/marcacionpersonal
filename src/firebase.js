// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0UWLAt0PFA1N0pWMYq3ACgQkCu4bfY0s",
  authDomain: "marcacionpersonal-77e7a.firebaseapp.com",
  projectId: "marcacionpersonal-77e7a",
  storageBucket: "marcacionpersonal-77e7a.firebasestorage.app",
  messagingSenderId: "1042822022926",
  appId: "1:1042822022926:web:6b63c644b2b57cd7fff95f",
  measurementId: "G-LV1DGR8WH0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };