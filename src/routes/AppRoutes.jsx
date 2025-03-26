import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../pages/login.jsx';
import Register from '../pages/register.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default AppRoutes;