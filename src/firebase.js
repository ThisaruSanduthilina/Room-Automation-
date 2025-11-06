import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration
// IMPORTANT: Get your config from Firebase Console:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project (riseoffice-22ca4)
// 3. Click on the gear icon > Project settings
// 4. Scroll down to "Your apps" section
// 5. Click on the web app icon (</>) or "Add app" if you haven't created one
// 6. Copy the firebaseConfig object

const firebaseConfig = {
  apiKey: "AIzaSyAfmVV0n1PenJU_ntMK4S9ZxK0P7WnipoM",
  authDomain: "riseoffice-22ca4.firebaseapp.com",
  databaseURL: "https://riseoffice-22ca4-default-rtdb.firebaseio.com",
  projectId: "riseoffice-22ca4",
  storageBucket: "riseoffice-22ca4.firebasestorage.app",
  messagingSenderId: "231906918177",
  appId: "1:231906918177:web:6a47b29d63a40bdb600860"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const database = getDatabase(app);

export { database };
