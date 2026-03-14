// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6CMZTr5yNi1NpKKcKwEsoA3hn-mrhCEg",
  authDomain: "coreinventoryodoo.firebaseapp.com",
  projectId: "coreinventoryodoo",
  storageBucket: "coreinventoryodoo.firebasestorage.app",
  messagingSenderId: "908803833701",
  appId: "1:908803833701:web:e1b82fdb4074fee8242b8c",
  measurementId: "G-XXZ30HFLKG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
