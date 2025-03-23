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

    return parts.join(" y ");
  };

  return (
    <div>
      {/* Búsqueda de texto */}
      <div className="mb-3">
        <div className="relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar en transacciones..."
            className="w-full px-3 py-2 pl-10 border rounded text-gray-800 bg-white"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Selector de orden */}
      <div className="mb-3 bg-gray-100 p-2 rounded">
        <div className="flex items-center">
          <label className="text-sm mr-2 font-medium text-black">
            Ordenar por:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-grow px-2 py-1 border rounded text-sm bg-white text-gray-800"
          >
            <option value="date-desc">Fecha (más reciente primero)</option>
            <option value="date-asc">Fecha (más antiguo primero)</option>
            <option value="amount-desc">Monto (mayor a menor)</option>
            <option value="amount-asc">Monto (menor a mayor)</option>
            <option value="category">Categoría (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filtros por categoría y tipo */}
      <div className="flex flex-col sm:flex-row gap-2 bg-gray-100 p-2 rounded">
        {/* Category filter dropdown */}
        <div className="flex items-center">
          <label className="text-sm mr-2 font-medium text-black">
            Categoría:
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`px-2 py-1 border rounded text-sm flex-grow bg-white ${
              categoryFilter !== "all"
                ? "border-blue-500 text-blue-800"
                : "text-gray-800"
            }`}
          >
            <option value="all">Todas</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Type filter dropdown */}
        <div className="flex items-center">
          <label className="text-sm mr-2 font-medium text-black">Tipo:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`px-2 py-1 border rounded text-sm flex-grow bg-white ${
              typeFilter !== "all"
                ? "border-blue-500 text-blue-800"
                : "text-gray-800"
            }`}
          >
            <option value="all">Todos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
        </div>
      </div>

      {/* Filtros por fecha */}
      <div className="mt-2 bg-gray-100 p-2 rounded">
        <div className="text-sm font-medium text-black mb-1">
          Filtrar por fecha:
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-1 items-center">
            <label className="text-sm mr-2 text-black">Desde:</label>
            <input
              type="date"
              name="startDate"
              value={dateFilter.startDate}
              onChange={handleDateFilterChange}
              className="w-full px-2 py-1 border rounded text-gray-800 text-sm bg-white"
            />
          </div>
          <div className="flex flex-1 items-center">
            <label className="text-sm mr-2 text-black">Hasta:</label>
            <input
              type="date"
              name="endDate"
              value={dateFilter.endDate}
              onChange={handleDateFilterChange}
              className="w-full px-2 py-1 border rounded text-gray-800 text-sm bg-white"
            />
          </div>
          {(dateFilter.startDate || dateFilter.endDate) && (
            <button
              onClick={clearDateFilter}
              className="text-sm text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded border"
            >
              Limpiar fechas
            </button>
          )}
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-2 text-sm text-blue-600">
          Filtrando por: {getFilterDescription()}
          {searchText && <span> • Búsqueda: "{searchText}"</span>}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
