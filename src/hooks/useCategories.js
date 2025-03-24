import { useEffect, useState } from "react";
import { auth } from "../services/firebaseConfig";
import {
  saveCategory as addUserCategory, 
  getUserCategories,
  deleteCategory as deleteUserCategory, 
} from "../services/categoryService";
/**
 * Hook personalizado para gestionar categorías de transacciones por usuario
 */
const useCategories = () => {
  const [predefinedCategories] = useState({
    income: [
      "Salario",
      "Ventas",
      "Inversiones",
      "Préstamo",
      "Regalo",
      "Otros ingresos",
    ],
    expense: [
      "Alimentación",
      "Transporte",
      "Vivienda",
      "Entretenimiento",
      "Salud",
      "Educación",
      "Ropa",
      "Servicios",
      "Otros gastos",
    ],
  });

  const [customCategories, setCustomCategories] = useState({ income: [], expense: [] });

  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  useEffect(() => {
    const fetchUserCategories = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const res = await getUserCategories(user.uid);
      if (res.success) {
        const income = res.categories
          .filter((c) => c.type === "income")
          .map((c) => ({ name: c.name, id: c.id }));

        const expense = res.categories
          .filter((c) => c.type === "expense")
          .map((c) => ({ name: c.name, id: c.id }));

        setCustomCategories({ income, expense });
      }
    };

    fetchUserCategories();
  }, []);

  /**
   * Añade una categoría personalizada
   */
  const addCategory = async (type, categoryName) => {
    if (!categoryName.trim()) return false;

    // Verifica si ya existe
    const all = [...predefinedCategories[type], ...customCategories[type].map(c => c.name)];
    if (all.includes(categoryName.trim())) return false;

    const user = auth.currentUser;
    if (!user) return false;

    const res = await addUserCategory(user.uid, type, categoryName.trim());
    if (res.success) {
      setCustomCategories((prev) => ({
        ...prev,
        [type]: [...prev[type], { name: categoryName.trim(), id: res.id }],
      }));
      return true;
    }

    return false;
  };

  /**
   * Elimina una categoría personalizada (no predefinida)
   */
  const removeCategory = async (type, categoryName) => {
    const catToRemove = customCategories[type].find((c) => c.name === categoryName);
    if (!catToRemove) return false;

    const res = await deleteUserCategory(catToRemove.id);
    if (res.success) {
      setCustomCategories((prev) => ({
        ...prev,
        [type]: prev[type].filter((c) => c.id !== catToRemove.id),
      }));
      return true;
    }

    return false;
  };

  /**
   * Devuelve la lista de categorías (predefinidas + personalizadas)
   */
  const getCategoriesByType = (type) => {
    const custom = customCategories[type]?.map((c) => c.name) || [];
    return [...predefinedCategories[type], ...custom];
  };

  return {
    predefinedCategories: {
      income: getCategoriesByType("income"),
      expense: getCategoriesByType("expense"),
    },
    newCategoryInput,
    setNewCategoryInput,
    showNewCategoryInput,
    setShowNewCategoryInput,
    addCategory,
    removeCategory,
    getCategoriesByType,
  };
};

export default useCategories;
