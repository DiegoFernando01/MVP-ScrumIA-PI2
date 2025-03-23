// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import AppRoutes from './routes/AppRoutes';  // Rutas públicas
import AuthRoutes from './routes/AuthRoutes';  // Rutas protegidas
import { AuthProvider } from './context/AuthContext';  // Proveedor de autenticación

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />   {/* Rutas públicas */}
        <AuthRoutes />  {/* Rutas protegidas */}
      </Router>
    </AuthProvider>
  );
}

export default App;
