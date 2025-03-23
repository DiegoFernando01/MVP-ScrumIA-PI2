import { auth } from './firebaseConfig';  // Importa la configuración de Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Función para registrar un nuevo usuario
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;  // Devuelve la credencial del usuario (información del usuario autenticado)
  } catch (error) {
    // Manejo de errores específico
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Este correo ya está registrado.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    } else {
      throw new Error(error.message);  // Error genérico
    }
  }
};

// Función para iniciar sesión de un usuario
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;  // Devuelve la credencial del usuario (información del usuario autenticado)
  } catch (error) {
    // Manejo de errores específico
    if (error.code === 'auth/user-not-found') {
      throw new Error('Usuario no encontrado. Verifica tu correo.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Contraseña incorrecta.');
    } else {
      throw new Error(error.message);  // Error genérico
    }
  }
};

// Función para cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth);  // Cierra la sesión del usuario
  } catch (error) {
    throw new Error('Error al cerrar sesión: ' + error.message);  // Manejo de errores al cerrar sesión
  }
};

