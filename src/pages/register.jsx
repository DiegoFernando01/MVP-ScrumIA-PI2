import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../services/auth.js";
import { saveUserData } from "../services/userService.js";
import { auth } from "../services/firebaseConfig.js";
import "../styles/Register.css";
// Importamos los iconos
import { FiMail, FiLock, FiUser, FiUsers, FiArrowRight } from "react-icons/fi";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  // Efecto para activar la animación inicial
  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");

    try {
      const fullName = `${firstName} ${lastName}`;
      await signUp(email, password, fullName);

      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error("No se pudo obtener el UID del usuario");
      }

      await saveUserData(firstName, lastName, email);
      setSuccessMessage("Te has registrado correctamente!");
      setIsRegistered(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/");
  };

  return (
    <div className="register-page">
      {/* Panel izquierdo con imagen */}
      <div className="register-image-panel">
        <div className="overlay">
          <div className="welcome-text">
            <h1>ScrumIA Finance</h1>
            <p>Comienza a administrar tus finanzas de manera inteligente</p>
          </div>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="register-form-panel">
        <div className={`register-form-container ${animate ? 'animate' : ''}`}>
          <div className="register-header">
            <div className="logo-container">
              <div className="logo">
                <FiUsers className="logo-icon" />
              </div>
            </div>
            <h2>Crea tu cuenta</h2>
            <p className="register-subtitle">Regístrate para comenzar a usar la aplicación</p>
          </div>

          {!isRegistered ? (
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="firstName">Nombre</label>
                <div className="input-group">
                  <FiUser className="input-icon" />
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <div className="input-group">
                  <FiUser className="input-icon" />
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Tu apellido"
                    required
                  />
                </div>
              </div>

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

              <div className="button-group">
                <button 
                  type="submit" 
                  className="register-button"
                >
                  <span className="button-content">
                    <span>Registrarme</span>
                    <FiArrowRight className="button-icon" />
                  </span>
                </button>
                
                <button 
                  type="button" 
                  onClick={handleLoginRedirect} 
                  className="login-redirect-button"
                >
                  Ya tengo cuenta
                </button>
              </div>
            </form>
          ) : (
            <div className="success-container">
              <div className="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="check-icon">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
              <h3>¡Registro Exitoso!</h3>
              <p>Tu cuenta ha sido creada correctamente.</p>
              <button 
                onClick={handleLoginRedirect}
                className="register-button"
              >
                <span className="button-content">
                  <span>Ir a Iniciar Sesión</span>
                  <FiArrowRight className="button-icon" />
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
