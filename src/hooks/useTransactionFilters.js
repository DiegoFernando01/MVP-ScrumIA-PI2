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
  // Nuevo: búsqueda por texto y ordenamiento
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("date-desc"); // Ordenar por fecha descendente por defecto

  /**
   * Filtra y ordena transacciones según los criterios seleccionados
   * @param {Array} transactions - Lista de transacciones a filtrar
   * @returns {Array} - Transacciones filtradas y ordenadas
   */
  const filterTransactions = (transactions) => {
    // Paso 1: Filtrar transacciones
    let filtered = transactions.filter((t) => {
      // Filtro por categoría
      if (categoryFilter !== "all" && t.category !== categoryFilter) {
        return false;
      }

      // Filtro por tipo
      if (typeFilter !== "all" && t.type !== typeFilter) {
        return false;
      }

      // Filtro por fecha
      if (dateFilter.startDate || dateFilter.endDate) {
        const transactionDate = new Date(t.date);

        if (
          dateFilter.startDate &&
          new Date(dateFilter.startDate) > transactionDate
        ) {
          return false;
        }

        if (
          dateFilter.endDate &&
          new Date(dateFilter.endDate) < transactionDate
        ) {
          return false;
        }
      }

      // Filtro por texto
      if (searchText.trim()) {
        const searchLower = searchText.trim().toLowerCase();
        const matchesDescription = t.description
          ?.toLowerCase()
          .includes(searchLower);
        const matchesCategory = t.category?.toLowerCase().includes(searchLower);
        const matchesAmount = t.amount?.toString().includes(searchLower);

        if (!matchesDescription && !matchesCategory && !matchesAmount) {
          return false;
        }
      }

      return true;
    });

    // Paso 2: Ordenar transacciones según el criterio seleccionado
    return sortTransactions(filtered, sortBy);
  };

  /**
   * Ordena un array de transacciones según un criterio
   * @param {Array} transactions - Transacciones a ordenar
   * @param {string} sortByOption - Criterio de ordenamiento
   * @returns {Array} - Transacciones ordenadas
   */
  const sortTransactions = (transactions, sortByOption) => {
    const sorted = [...transactions];

    switch (sortByOption) {
      case "date-asc":
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      case "date-desc":
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      case "amount-asc":
        return sorted.sort(
          (a, b) => parseFloat(a.amount) - parseFloat(b.amount)
        );
      case "amount-desc":
        return sorted.sort(
          (a, b) => parseFloat(b.amount) - parseFloat(a.amount)
        );
      case "category":
        return sorted.sort((a, b) => {
          const catA = (a.category || "").toLowerCase();
          const catB = (b.category || "").toLowerCase();
          return catA.localeCompare(catB);
        });
      default:
        return sorted;
    }
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
    setSearchText("");
    setSortBy("date-desc");
  };

  /**
   * Verifica si hay algún filtro activo
   */
  const hasActiveFilters = () => {
    return (
      categoryFilter !== "all" ||
      typeFilter !== "all" ||
      dateFilter.startDate !== "" ||
      dateFilter.endDate !== "" ||
      searchText.trim() !== ""
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
    // Nuevos métodos y propiedades
    searchText,
    setSearchText,
    sortBy,
    setSortBy,
    // Métodos existentes
    resetAllFilters,
    filterTransactions,
    hasActiveFilters,
  };
};

export default useTransactionFilters;
