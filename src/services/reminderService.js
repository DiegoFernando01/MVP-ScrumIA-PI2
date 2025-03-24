import { db } from "./firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

// Guarda un recordatorio
export const saveReminder = async (userId, reminder) => {
  try {
    const reminderId = reminder.id || `reminder-${Date.now()}`;
    const reminderData = {
      ...reminder,
      userId,
      id: reminderId,
    };

    await setDoc(doc(db, "reminders", reminderId), reminderData);
    return { success: true, id: reminderId };
  } catch (error) {
    console.error("Error guardando recordatorio:", error);
    return { success: false, error };
  }
};

// Obtiene todos los recordatorios de un usuario
export const getReminders = async (userId) => {
  try {
    const q = query(
      collection(db, "reminders"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const reminders = querySnapshot.docs.map((doc) => doc.data());

    return { success: true, reminders };
  } catch (error) {
    console.error("Error obteniendo recordatorios:", error);
    return { success: false, error };
  }
};

// Elimina un recordatorio
export const deleteReminder = async (reminderId) => {
  try {
    await deleteDoc(doc(db, "reminders", reminderId));
    return { success: true };
  } catch (error) {
    console.error("Error eliminando recordatorio:", error);
    return { success: false, error };
  }
};

// Actualiza un recordatorio
export const updateReminder = async (reminderId, updatedData) => {
  try {
    await updateDoc(doc(db, "reminders", reminderId), updatedData);
    return { success: true };
  } catch (error) {
    console.error("Error actualizando recordatorio:", error);
    return { success: false, error };
  }
};
