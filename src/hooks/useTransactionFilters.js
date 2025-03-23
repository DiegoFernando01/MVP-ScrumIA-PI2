import { useState } from "react";

/**
 * Hook personalizado para gestionar filtros de transacciones
 * @returns {Object} Métodos y estados para manejar filtros
 */
const useTransactionFilters = () => {
  // Estados para filtros
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  /**
   * Filtra transacciones según los criterios seleccionados
   * @param {Array} transactions - Lista de transacciones a filtrar
   * @returns {Array} - Transacciones filtradas
   */
  const filterTransactions = (transactions) => {
    return transactions.filter((t) => {
      // Filtro por categoría
      if (categoryFilter !== "all" && t.category !== categoryFilter) {
        return false;
      }

      // Filtro por tipo
      if (typeFilter !== "all" && t.type !== typeFilter) {
        return false;
      }

      // Filtro por fecha si se ha establecido alguna
      if (dateFilter.startDate || dateFilter.endDate) {
        const transactionDate = new Date(t.date);

        // Comprobar fecha de inicio
        if (
          dateFilter.startDate &&
          new Date(dateFilter.startDate) > transactionDate
        ) {
          return false;
        }

        // Comprobar fecha de fin
        if (
          dateFilter.endDate &&
          new Date(dateFilter.endDate) < transactionDate
        ) {
          return false;
        }
      }

      return true;
    });
  };

  /**
   * Maneja cambios en los filtros de fecha
   */
  const handleDateFilterChange = (e) => {
    setDateFilter({
      ...dateFilter,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Limpia los filtros de fecha
   */
  const clearDateFilter = () => {
    setDateFilter({
      startDate: "",
      endDate: "",
    });
  };

  /**
   * Resetea todos los filtros a sus valores predeterminados
   */
  const resetAllFilters = () => {
    setCategoryFilter("all");
    setTypeFilter("all");
    clearDateFilter();
  };

  /**
   * Verifica si hay algún filtro activo
   */
  const hasActiveFilters = () => {
    return (
      categoryFilter !== "all" ||
      typeFilter !== "all" ||
      dateFilter.startDate !== "" ||
      dateFilter.endDate !== ""
    );
  };

  return {
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    dateFilter,
    handleDateFilterChange,
    clearDateFilter,
    resetAllFilters,
    filterTransactions,
    hasActiveFilters,
  };
};

export default useTransactionFilters;
