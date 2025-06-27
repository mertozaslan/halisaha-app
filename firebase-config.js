// Import Firebase from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAzRBJGHKt6XcaMnls7nYp5Q_XB4yPR9I",
  authDomain: "halisaha-app-2c5a0.firebaseapp.com",
  projectId: "halisaha-app-2c5a0",
  storageBucket: "halisaha-app-2c5a0.firebasestorage.app",
  messagingSenderId: "902202433108",
  appId: "1:902202433108:web:10dfbfc7df522bb368d7c1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, updateDoc, doc, query, orderBy }; 