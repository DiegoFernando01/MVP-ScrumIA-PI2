import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../services/auth';  // Importa signUp desde auth.js
import { saveUserData } from '../services/userService';  // Importa la función para guardar datos en Firestore
import { auth } from '../services/firebaseConfig';  // Asegúrate de importar auth

function Register() {
  const [firstName, setFirstName] = useState('');  // Estado para nombre
  const [lastName, setLastName] = useState('');    // Estado para apellido
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
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
      setTimeout(() => {
        navigate('/');  // Redirige a la página de Login después de 2 segundos
      }, 2000);
    } catch (error) {
      setError(error.message);  // Si hay un error, lo mostramos
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            required
          />
        </div>
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
        {error && <p style={{ color: 'red' }}>{error}</p>}  {/* Mostrar error si lo hay */}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}  {/* Mostrar mensaje de éxito */}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
