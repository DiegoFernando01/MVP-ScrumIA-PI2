import { db } from "./firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";


/**
 * Guarda o actualiza un presupuesto para una categoría específica
 */
export const saveBudget = async (userId, category, amount, month, year) => {
  try {
    const docId = `${userId}_${category}_${month}_${year}`;
    await setDoc(doc(db, "budgets", docId), {
      userId,
      category,
      amount,
      month,
      year,
    });
    return { success: true };
  } catch (error) {
    console.error("Error guardando presupuesto:", error);
    return { success: false, error };
  }
};

/**
 * Obtiene los presupuestos del usuario para un mes y año específicos
 */
export const getBudgets = async (userId, month, year) => {
  try {
    const q = query(
      collection(db, "budgets"),
      where("userId", "==", userId),
      where("month", "==", month),
      where("year", "==", year)
    );

    const querySnapshot = await getDocs(q);
    const budgets = querySnapshot.docs.map((doc) => doc.data());

    return { success: true, budgets };
  } catch (error) {
    console.error("Error obteniendo presupuestos:", error);
    return { success: false, error };
  }
};

/**
 * Elimina un presupuesto de una categoría específica
 */
export const deleteBudget = async (userId, category, month, year) => {
  try {
    const docId = `${userId}_${category}_${month}_${year}`;
    await deleteDoc(doc(db, "budgets", docId));
    return { success: true };
  } catch (error) {
    console.error("Error eliminando presupuesto:", error);
    return { success: false, error };
  }
};
