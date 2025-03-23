import React, { useState, useEffect } from "react";

/**
 * Componente Wallet - Gestiona transacciones financieras personales
 *
 * MEJORA POTENCIAL: Este componente podría dividirse en varios componentes más pequeños:
 * - TransactionForm: Para el formulario de agregar transacciones
 * - TransactionList: Para mostrar y filtrar transacciones
 * - CategoryManager: Para administrar las categorías
 * - FilterPanel: Para los controles de filtrado
 */
function Wallet() {
  // =====================================================================
  // SECCIÓN DE ESTADOS
  // MEJORA POTENCIAL: Utilizar useReducer para manejar estados complejos
  // =====================================================================

  /**
   * Catálogo de categorías predefinidas organizadas por tipo
   * MEJORA POTENCIAL: Extraer a un archivo de configuración o servicio
   */
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

  /**
   * Estados para gestión de nuevas categorías
   * MEJORA POTENCIAL: Extraer a un hook personalizado como useCategoryManager
   */
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  /**
   * Estado principal para almacenar todas las transacciones
   * MEJORA POTENCIAL: Mover a context global o gestor de estado (Redux)
   */
  const [transactions, setTransactions] = useState([]);

  /**
   * Estado para datos del formulario de transacción
   * MEJORA POTENCIAL: Extraer a un hook personalizado como useTransactionForm
   */
  const [formData, setFormData] = useState({
    amount: "",
    type: "income",
    date: "",
    description: "",
    category: "",
  });

  /**
   * Estado para errores de validación del formulario
   */
  const [errors, setErrors] = useState({});

  /**
   * Estados para filtros de transacciones
   * MEJORA POTENCIAL: Extraer a un hook personalizado como useTransactionFilters
   */
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  // =====================================================================
  // SECCIÓN DE DATOS DE PRUEBA
  // MEJORA POTENCIAL: Extraer a un módulo separado testDataGenerator.js
  // =====================================================================

  /**
   * Genera datos de prueba para demostración de la funcionalidad
   * @returns {Array} Transacciones aleatorias generadas
   */
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

  // Cargar datos de prueba al inicio
  useEffect(() => {
    setTransactions(generateTestData());
  }, []);

  // =====================================================================
  // SECCIÓN DE UTILIDADES Y FILTRADO
  // MEJORA POTENCIAL: Extraer a un módulo separado transactionUtils.js
  // =====================================================================

  /**
   * Obtiene categorías únicas de las transacciones existentes
   * @returns {Array} Categorías únicas
   */
  const getUniqueCategories = () => {
    const categories = transactions.map((t) => t.category).filter((c) => c);
    return [...new Set(categories)];
  };

  /**
   * Filtra transacciones según criterios seleccionados (categoría, tipo, fecha)
   * MEJORA POTENCIAL: Convertir en función pura que reciba parámetros
   */
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

  // =====================================================================
  // SECCIÓN DE VALIDACIÓN
  // MEJORA POTENCIAL: Extraer a un módulo separado formValidation.js
  // =====================================================================

  /**
   * Valida los datos del formulario antes de crear una transacción
   * @returns {Object} Errores de validación encontrados
   */
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

  // =====================================================================
  // SECCIÓN DE MANEJO DE CAMBIOS Y EVENTOS
  // MEJORA POTENCIAL: Extraer a un hook personalizado useFormHandlers
  // =====================================================================

  /**
   * Maneja cambios en los campos del formulario
   * Tiene lógica especial para resetear categoría cuando cambia el tipo
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambia el tipo, resetear la categoría
    if (name === "type") {
      setFormData({
        ...formData,
        [name]: value,
        category: "", // Resetear categoría cuando cambia el tipo
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  /**
   * Maneja el envío del formulario para crear una nueva transacción
   * MEJORA POTENCIAL: Extraer lógica de persistencia a un servicio
   */
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

  /**
   * Limpia el formulario y restablece valores predeterminados
   */
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
   * Regenera datos de prueba y restablece filtros
   * MEJORA POTENCIAL: Solo disponible en modo desarrollo
   */
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

  // =====================================================================
  // SECCIÓN DE GESTIÓN DE CATEGORÍAS
  // MEJORA POTENCIAL: Extraer a un hook personalizado useCategoryManager
  // =====================================================================

  /**
   * Añade una nueva categoría al catálogo según el tipo seleccionado
   * Incluye validaciones para evitar duplicados
   */
  const addNewCategory = () => {
    if (!newCategoryInput.trim()) return;

    // Verificar que la categoría no exista ya
    if (predefinedCategories[formData.type].includes(newCategoryInput.trim())) {
      alert("Esta categoría ya existe");
      return;
    }

    // Agregar la nueva categoría
    setPredefinedCategories({
      ...predefinedCategories,
      [formData.type]: [
        ...predefinedCategories[formData.type],
        newCategoryInput.trim(),
      ],
    });

    // Seleccionar la nueva categoría
    setFormData({
      ...formData,
      category: newCategoryInput.trim(),
    });

    // Limpiar y ocultar el input
    setNewCategoryInput("");
    setShowNewCategoryInput(false);
  };

  // =====================================================================
  // RENDERIZADO DE COMPONENTE
  // MEJORA POTENCIAL: Dividir en subcomponentes como se mencionó arriba
  // =====================================================================
  return (
    <div className="p-4 max-w-md mx-auto">
      {/* 
        FORMULARIO DE TRANSACCIÓN
        MEJORA POTENCIAL: Extraer a componente <TransactionForm />
      */}
      <h1 className="text-xl font-semibold text-center mb-4">
        Agregar Transacción
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 rounded shadow"
      >
        {/* Campo: Monto */}
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

        {/* Campo: Tipo */}
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

        {/* Campo: Fecha */}
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

        {/* Campo: Descripción */}
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

        {/* 
          Campo: Categoría con selector y creación 
          MEJORA POTENCIAL: Extraer a componente <CategorySelector />
        */}
        <div>
          <label className="block mb-1 text-sm font-medium text-black">
            Categoría *
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-l text-gray-800"
              >
                <option value="">Seleccionar categoría</option>
                {predefinedCategories[formData.type]?.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 border-y border-r rounded-r"
                title="Agregar nueva categoría"
              >
                {showNewCategoryInput ? "✕" : "+"}
              </button>
            </div>

            {/* Input para nueva categoría */}
            {showNewCategoryInput && (
              <div className="flex mt-1">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="Nombre de nueva categoría"
                  className="flex-grow px-3 py-2 border rounded-l text-gray-800"
                />
                <button
                  type="button"
                  onClick={addNewCategory}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r"
                >
                  Agregar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
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

      {/* 
        ADMINISTRACIÓN DE CATEGORÍAS
        MEJORA POTENCIAL: Extraer a componente <CategoryManager />
      */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2 text-black">
          Administrar Categorías
        </h2>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() =>
              document
                .getElementById("incomeCategoriesSection")
                .scrollIntoView()
            }
            className={`px-3 py-1 rounded ${
              formData.type === "income"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Ingresos
          </button>
          <button
            onClick={() =>
              document
                .getElementById("expenseCategoriesSection")
                .scrollIntoView()
            }
            className={`px-3 py-1 rounded ${
              formData.type === "expense"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Gastos
          </button>
        </div>

        {/* Categorías de ingresos */}
        <div id="incomeCategoriesSection" className="mb-4">
          <h3 className="text-md font-medium text-gray-800 mb-2">
            Categorías de Ingresos
          </h3>
          <div className="flex flex-wrap gap-2">
            {predefinedCategories.income.map((cat) => (
              <div
                key={cat}
                className="bg-green-100 text-sm px-2 py-1 rounded flex items-center text-black"
              >
                <span>{cat}</span>
                <button
                  onClick={() => {
                    setPredefinedCategories({
                      ...predefinedCategories,
                      income: predefinedCategories.income.filter(
                        (c) => c !== cat
                      ),
                    });
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                  disabled={cat === "Otros ingresos"}
                  title={
                    cat === "Otros ingresos"
                      ? "No se puede eliminar esta categoría"
                      : "Eliminar categoría"
                  }
                >
                  {cat !== "Otros ingresos" && "×"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Categorías de gastos */}
        <div id="expenseCategoriesSection">
          <h3 className="text-md font-medium text-gray-800 mb-2">
            Categorías de Gastos
          </h3>
          <div className="flex flex-wrap gap-2">
            {predefinedCategories.expense.map((cat) => (
              <div
                key={cat}
                className="bg-red-100 text-sm px-2 py-1 rounded flex items-center text-black"
              >
                <span>{cat}</span>
                <button
                  onClick={() => {
                    setPredefinedCategories({
                      ...predefinedCategories,
                      expense: predefinedCategories.expense.filter(
                        (c) => c !== cat
                      ),
                    });
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                  disabled={cat === "Otros gastos"}
                  title={
                    cat === "Otros gastos"
                      ? "No se puede eliminar esta categoría"
                      : "Eliminar categoría"
                  }
                >
                  {cat !== "Otros gastos" && "×"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 
        LISTADO DE TRANSACCIONES
        MEJORA POTENCIAL: Extraer a componente <TransactionList />
      */}
      <div className="mt-6">
        <div className="mb-4">
          {/* Encabezado y botón de prueba */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Transacciones</h2>
            <button
              onClick={regenerateTestData}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700"
            >
              Regenerar datos de prueba
            </button>
          </div>

          {/* 
            Panel de filtros
            MEJORA POTENCIAL: Extraer a componente <FilterPanel />
          */}
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

          {/* Filtros de fecha */}
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

        {/* 
          Listado de transacciones filtradas
          MEJORA POTENCIAL: Extraer a componente <TransactionItems />
        */}
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
