import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../pages/login';
import Register from '../pages/register';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default AppRoutes;