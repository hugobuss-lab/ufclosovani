// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBchdjFEa0njLG5xpXWhPMJqq4O34gysNg",
    authDomain: "ufclosovani.firebaseapp.com",
    projectId: "ufclosovani",
    storageBucket: "ufclosovani.firebasestorage.app",
    messagingSenderId: "138751202363",
    appId: "1:138751202363:web:71fcefa92e79a90c9fb81e",
    measurementId: "G-Q4MZ39CYVD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Your game logic...
