import { db } from "./firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

/**
 * Guarda una categoría personalizada
 */
export const saveCategory = async (userId, type, name) => {
  try {
    const categoryId = `${type}-${name}`.toLowerCase().replace(/\s+/g, "-");
    const docRef = doc(db, "categories", categoryId);
    await setDoc(docRef, {
      userId,
      type,
      name,
      id: categoryId,
    });
    return { success: true };
  } catch (error) {
    console.error("Error guardando categoría:", error);
    return { success: false, error };
  }
};

/**
 * Elimina una categoría personalizada
 */
export const deleteCategory = async (userId, type, name) => {
  try {
    const categoryId = `${type}-${name}`.toLowerCase().replace(/\s+/g, "-");
    await deleteDoc(doc(db, "categories", categoryId));
    return { success: true };
  } catch (error) {
    console.error("Error eliminando categoría:", error);
    return { success: false, error };
  }
};

/**
 * Obtiene todas las categorías personalizadas de un usuario
 */
export const getUserCategories = async (userId) => {
  try {
    const q = query(
      collection(db, "categories"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const categories = snapshot.docs.map((doc) => doc.data());
    return { success: true, categories };
  } catch (error) {
    console.error("Error obteniendo categorías:", error);
    return { success: false, error };
  }
};
