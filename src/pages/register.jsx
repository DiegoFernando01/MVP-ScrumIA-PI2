import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../services/auth';  // Importa signUp desde auth.js
import { saveUserData } from '../services/userService';  // Importa la función para guardar datos en Firestore
import { auth } from '../services/firebaseConfig';  // Asegúrate de importar auth
import '../styles/Register.css';

function Register() {
  const [firstName, setFirstName] = useState('');  // Estado para nombre
  const [lastName, setLastName] = useState('');    // Estado para apellido
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false); // Estado para saber si el registro fue exitoso
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);  // Limpiar errores anteriores
    setSuccessMessage(''); // Limpiar el mensaje de éxito anterior

    try {
      // Registra al usuario con la función signUp
      await signUp(email, password);  

      // Obtén el UID del usuario autenticado
      const uid = auth.currentUser?.uid;

      if (!uid) {
        throw new Error('No se pudo obtener el UID del usuario');
      }

      // Guarda los datos adicionales (nombre, apellido, etc.) en Firestore
      await saveUserData(firstName, lastName, email); // Guarda los datos en Firestore

      setSuccessMessage('Te has registrado correctamente!'); // Muestra el mensaje de éxito
      setIsRegistered(true); // Cambia el estado a "registrado"
    } catch (error) {
      setError(error.message);  // Si ocurre un error, lo mostramos
    }
  };

  const handleLoginRedirect = () => {
    navigate('/');  
  };
  return (
    <div className="register-container">
      <h2>Registro</h2>

      {!isRegistered ? (
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nombre"
              required
            />
          </div>
          <div>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido"
              required
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
          </div>

          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}

          <div className="form-buttons">
            <button type="submit">Registrar</button>
            <button type="button" onClick={handleLoginRedirect}>
              Ir a Login
            </button>
          </div>
        </form>
      ) : (
        <div>
          <p className="success">¡Te has registrado con éxito!</p>
          <button onClick={handleLoginRedirect}>Ir a Login</button>
        </div>
      )}
    </div>
  );
}

export default Register;