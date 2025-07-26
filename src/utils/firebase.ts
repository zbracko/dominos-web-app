// Firebase configuration for Dominos multiplayer
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNvCVwFpmjb7_hGbnSHwbQ_Ir3LBSywPM",
  authDomain: "dominos-multiplayer.firebaseapp.com",
  databaseURL: "https://dominos-multiplayer-default-rtdb.firebaseio.com/",
  projectId: "dominos-multiplayer",
  storageBucket: "dominos-multiplayer.firebasestorage.app",
  messagingSenderId: "271495523586",
  appId: "1:271495523586:web:949b1d7710d1d3ba9ca61b",
  measurementId: "G-R4Y4WX7JT0"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Realtime Database
export const database = getDatabase(app)

export default app