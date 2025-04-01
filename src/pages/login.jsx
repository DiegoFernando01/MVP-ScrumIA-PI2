import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import "../styles/Login.css";
import { FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/wallet");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-image-panel">
        <div className="overlay">
          <div className="welcome-text">
            <h1>SmartWallet</h1>
            <p>Administra tus finanzas de manera inteligente</p>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className={`login-form-container ${animate ? 'animate' : ''}`}>
          <div className="login-header">
            <div className="logo-container">
              <div className="logo">
                <FiUser className="logo-icon" />
              </div>
            </div>
            <h2>Bienvenido de nuevo</h2>
            <p className="login-subtitle">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <div className="input-group">
                <FiMail className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="forgot-password">
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  <span className="loading-text">Iniciando sesión...</span>
                </span>
              ) : (
                <span className="button-content">
                  <span>Iniciar Sesión</span>
                  <FiArrowRight className="button-icon" />
                </span>
              )}
            </button>
          </form>

          <div className="register-link">
            <p>
              ¿No tienes cuenta?{" "}
              <a href="/register" className="signup-link">
                Regístrate ahora
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
