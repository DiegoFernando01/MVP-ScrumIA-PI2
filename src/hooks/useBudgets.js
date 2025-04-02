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

    // Verificar que tenemos transacciones para evaluar
    if (!transactions || transactions.length === 0) {
      console.log(`⚠️ No hay transacciones para evaluar en ${category}`);
      return {
        hasbudget: true,
        totalExpenses: 0,
        budgetAmount: budget.amount,
        percentage: 0,
        isOverBudget: false,
        isApproachingLimit: false,
      };
    }

    // Filtrar transacciones por categoría y tipo (solo gastos) del mes actual
    const { month, year } = getCurrentMonthYear();
    
    console.log(`🔎 Calculando presupuesto para ${category}, mes ${month}/${year}, evaluando ${transactions.length} transacciones`);
    
    // Formatear la fecha actual para comparar (primer día del mes)
    const currentMonthStart = new Date(year, month - 1, 1);
    // Último día del mes
    const currentMonthEnd = new Date(year, month, 0);
    
    const relevantTransactions = transactions.filter((t) => {
      // Verificar que la transacción tenga todos los campos necesarios
      if (!t || !t.category || !t.type || !t.amount || !t.date) {
        console.log("⚠️ Transacción con datos incompletos:", t);
        return false;
      }
      
      // Convertir la fecha de string a objeto Date con manejo de errores
      let transDate;
      try {
        // Asegurar que la fecha se parsee correctamente
        // Primero intentar ISO format (YYYY-MM-DD)
        if (t.date.includes("-")) {
          const [year, month, day] = t.date.split("-").map(Number);
          transDate = new Date(year, month - 1, day);
        } else if (t.date.includes("/")) {
          // Intentar formato DD/MM/YYYY
          const [day, month, year] = t.date.split("/").map(Number);
          transDate = new Date(year, month - 1, day);
        } else {
          // Último recurso: parseo directo
          transDate = new Date(t.date);
        }
        
        if (isNaN(transDate.getTime())) {
          console.log(`⚠️ Fecha inválida en transacción: ${t.date}`);
          return false;
        }
      } catch (error) {
        console.log(`⚠️ Error al parsear fecha: ${t.date}`, error);
        return false;
      }
      
      // Una transacción es relevante si:
      // 1. Es de la misma categoría
      // 2. Es un gasto
      // 3. Es del mismo mes y año (entre el primer y último día del mes)
      const match = (
        t.category === category &&
        t.type === "expense" &&
        transDate >= currentMonthStart &&
        transDate <= currentMonthEnd
      );
      
      if (t.category === category && t.type === "expense") {
        console.log(`🧮 Transacción: $${t.amount} (${t.date}) - Mes comparado: ${transDate.getMonth() + 1}/${transDate.getFullYear()} vs Actual: ${month}/${year} - ¿Coincide? ${match ? 'Sí' : 'No'}`);
      }
      
      return match;
    });
    
    console.log(`✅ Encontradas ${relevantTransactions.length} transacciones relevantes para ${category} en ${month}/${year}`);
    
    // Si encontramos transacciones relevantes, mostrar detalles para depuración
    if (relevantTransactions.length > 0) {
      relevantTransactions.forEach(t => {
        console.log(`💵 Transacción incluida: $${t.amount} (${t.date})`);
      });
    }
    
    // Calcular gastos totales
    const totalExpenses = relevantTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    // Calcular porcentaje de uso
    const percentage = (totalExpenses / budget.amount) * 100;
    
    console.log(`💰 Presupuesto para ${category}: $${budget.amount}, Gastos: $${totalExpenses}, Porcentaje: ${percentage.toFixed(1)}%`);

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
