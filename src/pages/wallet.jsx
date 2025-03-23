import React, { useState, useEffect } from "react";

function Wallet() {
  // Función para generar datos de prueba aleatorios
  const generateTestData = () => {
    const categories = {
      income: ["Salario", "Ventas", "Inversiones", "Préstamo", "Regalo"],
      expense: [
        "Alimentación",
        "Transporte",
        "Vivienda",
        "Entretenimiento",
        "Salud",
        "Educación",
        "Ropa",
      ],
    };

    const descriptions = {
      income: [
        "Pago mensual",
        "Venta de artículo",
        "Dividendos",
        "Devolución de impuestos",
        "Trabajo freelance",
      ],
      expense: [
        "Compra supermercado",
        "Taxi",
        "Pago de alquiler",
        "Cine",
        "Farmacia",
        "Curso online",
        "Restaurante",
      ],
    };

    // Generar fecha aleatoria en los últimos 90 días
    const getRandomDate = () => {
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - Math.floor(Math.random() * 90));
      return pastDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
    };

    // Crear 20 transacciones aleatorias
    const testData = [];
    for (let i = 0; i < 20; i++) {
      const type = Math.random() > 0.5 ? "income" : "expense";
      const category =
        categories[type][Math.floor(Math.random() * categories[type].length)];
      const description =
        descriptions[type][
          Math.floor(Math.random() * descriptions[type].length)
        ];

      testData.push({
        id: Date.now() + i,
        type: type,
        amount: (Math.random() * 990 + 10).toFixed(2),
        date: getRandomDate(),
        description: description,
        category: category,
      });
    }

    // Ordenar por fecha, más recientes primero
    return testData.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Usar datos de prueba como estado inicial
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    type: "income",
    date: "",
    description: "",
    category: "",
  });
  const [errors, setErrors] = useState({});
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  // Cargar datos de prueba al inicio
  useEffect(() => {
    setTransactions(generateTestData());
  }, []);

  // Get unique categories from transactions
  const getUniqueCategories = () => {
    const categories = transactions.map((t) => t.category).filter((c) => c);
    return [...new Set(categories)];
  };

  // Filter transactions by selected category, type and date range
  const filteredTransactions = transactions.filter((t) => {
    // Apply category filter
    if (categoryFilter !== "all" && t.category !== categoryFilter) {
      return false;
    }

    // Apply type filter
    if (typeFilter !== "all" && t.type !== typeFilter) {
      return false;
    }

    // Apply date filter if either start or end date is set
    if (dateFilter.startDate || dateFilter.endDate) {
      const transactionDate = new Date(t.date);

      // Check start date if set
      if (
        dateFilter.startDate &&
        new Date(dateFilter.startDate) > transactionDate
      ) {
        return false;
      }

      // Check end date if set
      if (
        dateFilter.endDate &&
        new Date(dateFilter.endDate) < transactionDate
      ) {
        return false;
      }
    }

    return true;
  });

  const validate = () => {
    const newErrors = {};
    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      Number(formData.amount) <= 0
    ) {
      newErrors.amount = "El monto debe ser un número mayor a cero.";
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      newErrors.date = "La fecha debe tener el formato YYYY-MM-DD.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setTransactions([...transactions, { ...formData, id: Date.now() }]);
    setFormData({
      amount: "",
      type: "income",
      date: "",
      description: "",
      category: "",
    });
    setErrors({});
  };

  // Agregar esta nueva función para limpiar el formulario
  const handleClear = () => {
    setFormData({
      amount: "",
      type: "income",
      date: "",
      description: "",
      category: "",
    });
    setErrors({});
  };

  // Handle date filter changes
  const handleDateFilterChange = (e) => {
    setDateFilter({
      ...dateFilter,
      [e.target.name]: e.target.value,
    });
  };

  // Clear date filters
  const clearDateFilter = () => {
    setDateFilter({
      startDate: "",
      endDate: "",
    });
  };

  // Añadir función para regenerar datos de prueba
  const regenerateTestData = () => {
    setTransactions(generateTestData());
    // Resetear filtros
    setCategoryFilter("all");
    setTypeFilter("all");
    setDateFilter({
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Formulario para agregar transacciones */}
      <h1 className="text-xl font-semibold text-center mb-4">
        Agregar Transacción
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 rounded shadow"
      >
        <div>
          <label className="block mb-1 text-sm font-medium text-black">
            Monto *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-gray-800"
            placeholder="Ej: 100.00"
          />
          {errors.amount && (
            <p className="text-red-500 text-xs">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-black">
            Tipo*
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-gray-800 "
          >
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-black">
            Fecha*
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-gray-800"
          />
          {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-black">
            Descripción
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-gray-800"
            placeholder="Ej: Compra supermercado"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-black">
            Categoría
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-gray-800"
            placeholder="Ej: Alimentos, Transporte"
          />
        </div>

        {/* Reemplazar el botón existente con dos botones en un contenedor flex */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Agregar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
          >
            Limpiar
          </button>
        </div>
      </form>
      {/* Listado de transacciones */}
      <div className="mt-6">
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Transacciones</h2>
            <button
              onClick={regenerateTestData}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700"
            >
              Regenerar datos de prueba
            </button>
          </div>

          {/* Filters section */}
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
                {getUniqueCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Type filter dropdown */}
            <div className="flex items-center">
              <label className="text-sm mr-2 font-medium text-black">
                Tipo:
              </label>
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

          {/* Date filter section */}
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

          {/* Mostrar indicador de filtros activos */}
          {(categoryFilter !== "all" ||
            typeFilter !== "all" ||
            dateFilter.startDate ||
            dateFilter.endDate) && (
            <div className="mt-2 text-sm text-blue-600">
              Filtrando por:{" "}
              {typeFilter !== "all"
                ? typeFilter === "income"
                  ? "Ingresos"
                  : "Gastos"
                : ""}
              {typeFilter !== "all" &&
              (categoryFilter !== "all" ||
                dateFilter.startDate ||
                dateFilter.endDate)
                ? " y "
                : ""}
              {categoryFilter !== "all" ? `Categoría "${categoryFilter}"` : ""}
              {categoryFilter !== "all" &&
              (dateFilter.startDate || dateFilter.endDate)
                ? " y "
                : ""}
              {dateFilter.startDate && `Desde ${dateFilter.startDate}`}
              {dateFilter.startDate && dateFilter.endDate && " - "}
              {dateFilter.endDate && `Hasta ${dateFilter.endDate}`}
            </div>
          )}
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500">
            {transactions.length === 0
              ? "Aún no hay transacciones registradas."
              : "No hay transacciones que coincidan con los filtros seleccionados."}
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredTransactions.map((t) => (
              <li
                key={t.id}
                className={`p-3 rounded shadow text-sm ${
                  t.type === "income" ? "bg-green-300" : "bg-red-300"
                }`}
              >
                <div className="flex justify-between text-black">
                  <span>{t.description || "Sin descripción"}</span>
                  <span className="font-semibold">
                    {t.type === "income" ? "+" : "-"}$
                    {parseFloat(t.amount).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {t.date} • {t.category || "Sin categoría"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Wallet;
