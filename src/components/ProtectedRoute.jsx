// src/components/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { user } = useAuth();  // Obtiene el estado del usuario desde el contexto

  if (!user) {
    // Si no hay usuario, redirigimos al login
    return <Navigate to="/" />;
  }

  return children;  // Si hay usuario, renderizamos los children (páginas protegidas)
}

export default ProtectedRoute;  // Exportación por defecto