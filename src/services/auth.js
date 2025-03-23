// src/services/auth.js
import { auth } from './firebaseConfig';  // Importa la configuración de Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Función para registrar un nuevo usuario
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;  // Devuelve la credencial del usuario (información del usuario autenticado)
  } catch (error) {
    throw new Error(error.message);  // Maneja errores (por ejemplo, si el correo ya está en uso)
  }
};

// Función para iniciar sesión de un usuario
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;  // Devuelve la credencial del usuario (información del usuario autenticado)
  } catch (error) {
    throw new Error(error.message);  // Maneja errores (por ejemplo, si las credenciales son incorrectas)
  }
};

// Función para cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth);  // Cierra la sesión del usuario
  } catch (error) {
    throw new Error(error.message);  // Maneja errores al cerrar sesión
  }
};
