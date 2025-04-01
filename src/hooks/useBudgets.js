import { useState, useEffect } from "react";
import { getBudgets, saveBudget, deleteBudget } from "../services/budgetService";
import { auth } from "../services/firebaseConfig";

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
 * Hook personalizado para gestionar presupuestos por categoría
 * @returns {Object} Métodos y estados para manejar presupuestos
 */
const useBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  // Estado para almacenar los presupuestos por categoría
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchBudgets = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const { month, year } = getCurrentMonthYear();
    const res = await getBudgets(user.uid, month, year);

    if (res.success) {
      setBudgets(res.budgets);
    }

    setLoading(false);
  };

  fetchBudgets();

  
}, []);


  
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
  const setBudgetForCategory = async (category, amount) => {
    if (amount <= 0) return false;
  
    const { month, year } = getCurrentMonthYear();
    const user = auth.currentUser;
    if (!user) return false;
  
    const res = await saveBudget(user.uid, category, amount, month, year);
    if (res.success) {
      // Actualiza el estado local
      const updatedBudgets = [...budgets];
      const index = updatedBudgets.findIndex(
        (b) => b.category === category && b.month === month && b.year === year
      );
  
      if (index >= 0) {
        updatedBudgets[index].amount = amount;
      } else {
        updatedBudgets.push({ category, amount, month, year });
      }
  
      setBudgets(updatedBudgets);
      return true;
    }
  
    return false;
  };
  

  /**
   * Elimina un presupuesto para una categoría
   * @param {string} category - Nombre de la categoría
   * @returns {boolean} Indica si la operación fue exitosa
   */
  const removeBudgetForCategory = async (category) => {
    const { month, year } = getCurrentMonthYear();
    const user = auth.currentUser;
    if (!user) return false;
  
    const res = await deleteBudget(user.uid, category, month, year);
    if (res.success) {
      setBudgets(budgets.filter(
        (b) => !(b.category === category && b.month === month && b.year === year)
      ));
      return true;
    }
  
    return false;
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

    transactions.forEach((t) => {
      const transDate = new Date(t.date);
      console.log(`→ Revisando transacción:`, {
        category: t.category,
        amount: t.amount,
        date: t.date,
        parsedMonth: transDate.getMonth() + 1,
        parsedYear: transDate.getFullYear(),
        matches: t.category === category &&
                 t.type === "expense" &&
                 transDate.getMonth() + 1 === month &&
                 transDate.getFullYear() === year
      });
    });
    
    const relevantTransactions = transactions.filter((t) => {
      const transDate = new Date(`${t.date}T00:00:00`);
      const match = (
        t.category === category &&
        t.type === "expense" &&
        t.userId === auth.currentUser?.uid &&
        transDate.getMonth() + 1 === month &&
        transDate.getFullYear() === year
      );
    
      console.log("🔍 Evaluando:", {
        category: t.category,
        type: t.type,
        date: t.date,
        parsedMonth: transDate.getMonth() + 1,
        parsedYear: transDate.getFullYear(),
        match
      });
    
      return match;
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
    loading,
    budgets: getCurrentBudgets(),
    getBudgetForCategory,
    setBudgetForCategory,
    removeBudgetForCategory,
    calculateBudgetUsage,
  };
};

export default useBudgets;
