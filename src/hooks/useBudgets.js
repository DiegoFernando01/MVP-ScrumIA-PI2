import { useState, useEffect } from "react";

/**
 * Hook personalizado para gestionar presupuestos por categoría
 * @returns {Object} Métodos y estados para manejar presupuestos
 */
const useBudgets = () => {
  // Estado para almacenar los presupuestos por categoría
  const [budgets, setBudgets] = useState([]);

  // Cargar presupuestos guardados al iniciar
  useEffect(() => {
    const savedBudgets = localStorage.getItem("categoryBudgets");
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Guardar presupuestos cuando cambian
  useEffect(() => {
    if (budgets.length > 0) {
      localStorage.setItem("categoryBudgets", JSON.stringify(budgets));
    }
  }, [budgets]);

  /**
   * Obtiene el mes y año actual para filtrado de presupuestos
   * @returns {Object} Objeto con mes y año actuales
   */
  const getCurrentMonthYear = () => {
    const date = new Date();
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  };

  /**
   * Obtiene el presupuesto para una categoría específica en el mes actual
   * @param {string} category - Nombre de la categoría
   * @returns {Object|null} Presupuesto encontrado o null
   */
  const getBudgetForCategory = (category) => {
    const { month, year } = getCurrentMonthYear();
    return (
      budgets.find(
        (b) => b.category === category && b.month === month && b.year === year
      ) || null
    );
  };

  /**
   * Establece o actualiza un presupuesto para una categoría
   * @param {string} category - Nombre de la categoría
   * @param {number} amount - Monto del presupuesto
   * @returns {boolean} Indica si la operación fue exitosa
   */
  const setBudgetForCategory = (category, amount) => {
    // Validar que el monto sea positivo
    if (amount <= 0) return false;

    const { month, year } = getCurrentMonthYear();

    // Verificar si ya existe un presupuesto para esta categoría este mes
    const existingBudgetIndex = budgets.findIndex(
      (b) => b.category === category && b.month === month && b.year === year
    );

    if (existingBudgetIndex >= 0) {
      // Actualizar presupuesto existente
      const updatedBudgets = [...budgets];
      updatedBudgets[existingBudgetIndex] = {
        ...updatedBudgets[existingBudgetIndex],
        amount,
      };
      setBudgets(updatedBudgets);
    } else {
      // Crear nuevo presupuesto
      setBudgets([...budgets, { category, amount, month, year }]);
    }

    return true;
  };

  /**
   * Elimina un presupuesto para una categoría
   * @param {string} category - Nombre de la categoría
   * @returns {boolean} Indica si la operación fue exitosa
   */
  const removeBudgetForCategory = (category) => {
    const { month, year } = getCurrentMonthYear();

    const filteredBudgets = budgets.filter(
      (b) => !(b.category === category && b.month === month && b.year === year)
    );

    if (filteredBudgets.length === budgets.length) {
      return false; // No se encontró el presupuesto
    }

    setBudgets(filteredBudgets);
    return true;
  };

  /**
   * Calcula el porcentaje utilizado de un presupuesto para una categoría
   * @param {string} category - Nombre de la categoría
   * @param {Array} transactions - Lista de transacciones para calcular gastos
   * @returns {Object} Información sobre utilización del presupuesto
   */
  const calculateBudgetUsage = (category, transactions) => {
    const budget = getBudgetForCategory(category);

    if (!budget) {
      return {
        hasbudget: false,
        totalExpenses: 0,
        budgetAmount: 0,
        percentage: 0,
        isOverBudget: false,
        isApproachingLimit: false,
      };
    }

    // Filtrar transacciones por categoría y tipo (solo gastos) del mes actual
    const { month, year } = getCurrentMonthYear();
    const relevantTransactions = transactions.filter((t) => {
      const transDate = new Date(t.date);
      return (
        t.category === category &&
        t.type === "expense" &&
        transDate.getMonth() + 1 === month &&
        transDate.getFullYear() === year
      );
    });

    // Calcular gastos totales
    const totalExpenses = relevantTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    // Calcular porcentaje de uso
    const percentage = (totalExpenses / budget.amount) * 100;

    return {
      hasbudget: true,
      totalExpenses,
      budgetAmount: budget.amount,
      percentage,
      isOverBudget: percentage > 100,
      isApproachingLimit: percentage >= 90 && percentage <= 100,
    };
  };

  /**
   * Obtiene todos los presupuestos para el mes actual
   */
  const getCurrentBudgets = () => {
    const { month, year } = getCurrentMonthYear();
    return budgets.filter((b) => b.month === month && b.year === year);
  };

  return {
    budgets: getCurrentBudgets(),
    getBudgetForCategory,
    setBudgetForCategory,
    removeBudgetForCategory,
    calculateBudgetUsage,
  };
};

export default useBudgets;
