// src/routes/AuthRoutes.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Wallet from '../pages/Wallet';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

function AuthRoutes() {
  return (
    <Routes>
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AuthRoutes;
