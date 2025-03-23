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
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
