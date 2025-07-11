// src/services/firebaseConfig.js (o donde configures Firebase)
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';  // Importa la función de registro de usuario
import { getFirestore } from 'firebase/firestore'; // ✅ importar Firestore


const firebaseConfig = {
  apiKey: "AIzaSyDW4NU6Gp4TMy9tA1q0KQrH7gSNpTaaFL0",
  authDomain: "smartwallet-c0e4b.firebaseapp.com",
  projectId: "smartwallet-c0e4b",
  storageBucket: "smartwallet-c0e4b.firebasestorage.app",
  messagingSenderId: "487636402818",
  appId: "1:487636402818:web:c6446371e26ef31da56a9b",
  measurementId: "G-FH1F63VVK6"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Usamos getAuth para obtener la autenticación
const db = getFirestore(app); // ✅ instancia de Firestore


export { auth, db, createUserWithEmailAndPassword }; // Exportamos la función también
