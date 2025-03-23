import { useState } from "react";

/**
 * Hook personalizado para gestionar categorías de transacciones
 * @returns {Object} Métodos y estados para manejar categorías
 */
const useCategories = () => {
  // Categorías predefinidas por tipo
  const [predefinedCategories, setPredefinedCategories] = useState({
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

  // Estados para nueva categoría
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  /**
   * Añade una nueva categoría al catálogo
   * @param {string} type - Tipo de categoría ('income' o 'expense')
   * @param {string} categoryName - Nombre de la nueva categoría
   * @returns {boolean} - Indica si la categoría se añadió con éxito
   */
  const addCategory = (type, categoryName) => {
    if (!categoryName.trim()) return false;

    // Verificar que la categoría no exista ya
    if (predefinedCategories[type].includes(categoryName.trim())) {
      return false;
    }

    // Agregar la nueva categoría
    setPredefinedCategories({
      ...predefinedCategories,
      [type]: [...predefinedCategories[type], categoryName.trim()],
    });

    return true;
  };

  /**
   * Elimina una categoría del catálogo
   * @param {string} type - Tipo de categoría ('income' o 'expense')
   * @param {string} categoryName - Nombre de la categoría a eliminar
   */
  const removeCategory = (type, categoryName) => {
    // No permitir eliminar categorías por defecto
    if (
      (type === "income" && categoryName === "Otros ingresos") ||
      (type === "expense" && categoryName === "Otros gastos")
    ) {
      return false;
    }

    setPredefinedCategories({
      ...predefinedCategories,
      [type]: predefinedCategories[type].filter((c) => c !== categoryName),
    });

    return true;
  };

  /**
   * Obtiene las categorías disponibles para un tipo específico
   * @param {string} type - Tipo de categoría ('income' o 'expense')
   * @returns {Array} - Lista de categorías disponibles
   */
  const getCategoriesByType = (type) => {
    return predefinedCategories[type] || [];
  };

  return {
    predefinedCategories,
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
