// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../services/firebaseConfig';  // Importa la configuración de Firebase
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Verifica el estado de autenticación del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Función para hacer login
  const login = async (email, password) => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      setUser(userCredential.user);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Función para hacer registro
  const signUp = async (email, password) => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      setUser(userCredential.user);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Función para hacer logout
  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
