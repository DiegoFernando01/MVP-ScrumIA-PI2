// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';  // Asegúrate de importar la función login desde auth.js
import '../styles/Login.css';  // Importa el archivo de estilos

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);  // Resetea el error al enviar el formulario

    try {
      await login(email, password);  // Llama a la función login desde auth.js
      navigate('/wallet');  // Redirige a la página de wallet después de un inicio de sesión exitoso
    } catch (error) {
      setError(error.message);  // Si ocurre un error, lo mostramos
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}  {/* Mostrar el error si existe */}
        <button type="submit">Login</button>
      </form>
      <div>
        <p>¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
      </div>
    </div>
  );
}

export default Login;
