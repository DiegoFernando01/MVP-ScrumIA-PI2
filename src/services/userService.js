import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig"; // Importa la configuración de Firebase

// Función para guardar usuario en Firestore
export const saveUserData = async (firstName, lastName, email) => {
  const db = getFirestore();
  const uid = auth.currentUser?.uid; // Obtenemos el UID del usuario autenticado

  if (!uid) {
    console.error('Usuario no autenticado. No se puede guardar la información.');
    alert('No estás autenticado. Por favor, inicia sesión.');
    return;
  }

  try {
    // Creamos o actualizamos el documento en la colección 'Usuarios'
    await setDoc(doc(db, 'Usuarios', uid), {
      firstName,
      lastName,
      email,
      createdAt: new Date(),
    });
    console.log('Datos de usuario guardados con éxito');
    alert('Tus datos han sido guardados con éxito.');  // Notifica al usuario
  } catch (error) {
    console.error('Error saving user data: ', error);
    alert('Hubo un error al guardar tus datos. Intenta nuevamente.');  // Notificación de error
  }
};

// Obtener datos del usuario desde Firestore
export const getUserData = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, "Usuarios", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data(); // Devuelve { firstName, lastName, email }
  } else {
    return null;
  }
};

