import React from "react";

/**
 * Panel de filtros para transacciones
 */
const FilterPanel = ({
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter,
  dateFilter,
  handleDateFilterChange,
  clearDateFilter,
  uniqueCategories,
  hasActiveFilters,
  // Nuevos props para búsqueda y ordenamiento
  searchText,
  setSearchText,
  sortBy,
  setSortBy,
  resetAllFilters,
}) => {
  // Función de ayuda para formatear los mensajes de filtro
  const getFilterDescription = () => {
    const parts = [];

    if (typeFilter !== "all") {
      parts.push(typeFilter === "income" ? "Ingresos" : "Gastos");
    }

    if (categoryFilter !== "all") {
      parts.push(`Categoría "${categoryFilter}"`);
    }

    if (dateFilter.startDate) {
      parts.push(`Desde ${dateFilter.startDate}`);
    }

    if (dateFilter.endDate) {
      parts.push(`Hasta ${dateFilter.endDate}`);
    }

    if (searchText) {
      parts.push(`Búsqueda: "${searchText}"`);
    }

    return parts.join(" y ");
  };

  return (
    <div className="filters-container">
      <h4 className="filter-heading">
        <span className="filter-heading-icon">🔍</span>
        Filtros y Búsqueda
      </h4>
      
      {/* Búsqueda de texto */}
      <div className="form-group">
        <label className="filter-label">Buscar en transacciones</label>
        <div className="input-with-icon">
          <span className="input-icon">🔍</span>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Busca por descripción, categoría o monto..."
            className="filter-input with-icon"
          />
        </div>
        {searchText && (
          <button
            onClick={() => setSearchText("")}
            className="btn-filter btn-filter-secondary"
          >
            <span>🗑️</span> Limpiar búsqueda
          </button>
        )}
      </div>

      {/* Selector de orden */}
      <div className="form-group">
        <label className="filter-label">Ordenar por</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="date-desc">Fecha (más reciente primero)</option>
          <option value="date-asc">Fecha (más antiguo primero)</option>
          <option value="amount-desc">Monto (mayor a menor)</option>
          <option value="amount-asc">Monto (menor a mayor)</option>
          <option value="category">Categoría (A-Z)</option>
        </select>
      </div>

      <div className="filters-grid">
        {/* Filtro por categoría */}
        <div className="filter-group">
          <label className="filter-label">Categoría</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`filter-select ${
              categoryFilter !== "all" ? "active-filter" : ""
            }`}
          >
            <option value="all">Todas las categorías</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por tipo */}
        <div className="filter-group">
          <label className="filter-label">Tipo de transacción</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`filter-select ${
              typeFilter !== "all" ? "active-filter" : ""
            }`}
          >
            <option value="all">Todos los tipos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
        </div>

        {/* Filtro por fecha: inicio */}
        <div className="filter-group">
          <label className="filter-label">Fecha desde</label>
          <input
            type="date"
            name="startDate"
            value={dateFilter.startDate}
            onChange={handleDateFilterChange}
            className={`filter-input ${
              dateFilter.startDate ? "active-filter" : ""
            }`}
          />
        </div>

        {/* Filtro por fecha: fin */}
        <div className="filter-group">
          <label className="filter-label">Fecha hasta</label>
          <input
            type="date"
            name="endDate"
            value={dateFilter.endDate}
            onChange={handleDateFilterChange}
            className={`filter-input ${
              dateFilter.endDate ? "active-filter" : ""
            }`}
          />
        </div>
      </div>

      {/* Botones de acción para filtros */}
      <div className="filter-actions">
        {(dateFilter.startDate || dateFilter.endDate) && (
          <button
            onClick={clearDateFilter}
            className="btn-filter btn-filter-secondary"
          >
            <span>📅</span> Limpiar fechas
          </button>
        )}
        
        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="btn-filter btn-filter-primary"
          >
            <span>🔄</span> Restablecer todos los filtros
          </button>
        )}
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="active-filters-indicator">
          <strong>Filtros activos:</strong> {getFilterDescription()}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
