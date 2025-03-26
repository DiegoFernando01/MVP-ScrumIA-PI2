import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../services/auth.js"; // Importa signUp desde auth.js
import { saveUserData } from "../services/userService.js"; // Importa la función para guardar datos en Firestore
import { auth } from "../services/firebaseConfig"; // Asegúrate de importar auth
import "../styles/Register.css";


function Register() {
  const [firstName, setFirstName] = useState(""); // Estado para nombre
  const [lastName, setLastName] = useState(""); // Estado para apellido
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false); // Estado para saber si el registro fue exitoso
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores anteriores
    setSuccessMessage(""); // Limpiar el mensaje de éxito anterior

    try {
      
      const fullName = `${firstName} ${lastName}`;
      await signUp(email, password, fullName);

      // Obtén el UID del usuario autenticado
      const uid = auth.currentUser?.uid;

      if (!uid) {
        throw new Error("No se pudo obtener el UID del usuario");
      }

      // Guarda los datos adicionales (nombre, apellido, etc.) en Firestore
      await saveUserData(firstName, lastName, email); // Guarda los datos en Firestore

      setSuccessMessage("Te has registrado correctamente!"); // Muestra el mensaje de éxito
      setIsRegistered(true); // Cambia el estado a "registrado"
    } catch (error) {
      setError(error.message); // Si ocurre un error, lo mostramos
    }
  };

  const handleLoginRedirect = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Registro
        </h2>

        {!isRegistered ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Tu nombre"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Apellido
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Tu apellido"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-green-50 p-3">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Registrar
              </button>
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-white font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Ir a Login
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <p className="text-lg font-medium text-green-700">
                ¡Te has registrado con éxito!
              </p>
            </div>
            <button
              onClick={handleLoginRedirect}
              className="rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Ir a Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
