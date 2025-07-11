// src/services/firebaseConfig.js (o donde configures Firebase)
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';  // Importa la función de registro de usuario
import { getFirestore } from 'firebase/firestore'; // ✅ importar Firestore


const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Usamos getAuth para obtener la autenticación
const db = getFirestore(app); // ✅ instancia de Firestore


export { auth, db, createUserWithEmailAndPassword }; // Exportamos la función también
