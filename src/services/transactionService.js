// src/services/transactionService.js
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

/**
 * Guarda o actualiza una transacción
 */
export const saveTransaction = async (userId, transaction) => {
  try {
    const id = transaction.id || `txn-${Date.now()}`;
    const ref = doc(db, "transactions", id);

    await setDoc(ref, {
      ...transaction,
      id,
      userId,
    });

    return { success: true, id };
  } catch (error) {
    console.error("Error guardando transacción:", error);
    return { success: false, error };
  }
};

/**
 * Obtiene todas las transacciones de un usuario
 */
export const getUserTransactions = async (userId) => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map((doc) => doc.data());
    return { success: true, transactions };
  } catch (error) {
    console.error("Error obteniendo transacciones:", error);
    return { success: false, error };
  }
};

/**
 * Elimina una transacción por ID
 */
export const deleteTransaction = async (transactionId) => {
  try {
    await deleteDoc(doc(db, "transactions", transactionId));
    return { success: true };
  } catch (error) {
    console.error("Error eliminando transacción:", error);
    return { success: false, error };
  }
};

/**
 * Actualiza una transacción existente
 */
export const updateTransaction = async (transactionId, data) => {
  try {
    await updateDoc(doc(db, "transactions", transactionId), data);
    return { success: true };
  } catch (error) {
    console.error("Error actualizando transacción:", error);
    return { success: false, error };
  }
};