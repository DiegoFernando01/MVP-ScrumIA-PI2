import React, { useState } from "react";

/**
 * Componente para gestionar presupuestos por categoría
 */
const BudgetManager = ({
  categories,
  budgets,
  setBudgetForCategory,
  removeBudgetForCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [error, setError] = useState("");

  // Buscar presupuesto existente al seleccionar categoría
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    // Si hay un presupuesto existente, cargar su valor
    const existingBudget = budgets.find((b) => b.category === category);
    setBudgetAmount(existingBudget ? existingBudget.amount.toString() : "");
    setError("");
  };

  const handleAmountChange = (e) => {
    setBudgetAmount(e.target.value);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      setError("Debes seleccionar una categoría");
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("El presupuesto debe ser un número positivo");
      return;
    }

    // Guardar presupuesto
    const success = setBudgetForCategory(selectedCategory, amount);
    if (success) {
      // Limpiar formulario
      setSelectedCategory("");
      setBudgetAmount("");
      setError("");
    } else {
      setError("No se pudo guardar el presupuesto");
    }
  };

  const handleDelete = () => {
    if (!selectedCategory) {
      setError("Debes seleccionar una categoría");
      return;
    }

    const success = removeBudgetForCategory(selectedCategory);
    if (success) {
      setSelectedCategory("");
      setBudgetAmount("");
      setError("");
    } else {
      setError("No se pudo eliminar el presupuesto");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4 text-black">
        Presupuestos por Categoría
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de categoría */}
        <div>
          <label className="block mb-1 text-sm font-medium text-black">
            Categoría de gasto
          </label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border rounded text-gray-800"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Input de monto */}
        <div>
          <label className="block mb-1 text-sm font-medium text-black">
            Presupuesto mensual
          </label>
          <input
            type="number"
            value={budgetAmount}
            onChange={handleAmountChange}
            placeholder="Ej: 1000.00"
            className="w-full px-3 py-2 border rounded text-gray-800"
          />
        </div>

        {/* Mensaje de error */}
        {error && <p className="text-red-500 text-xs">{error}</p>}

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Guardar Presupuesto
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
            disabled={
              !selectedCategory ||
              !budgets.some((b) => b.category === selectedCategory)
            }
          >
            Eliminar
          </button>
        </div>
      </form>

      {/* Lista de presupuestos actuales */}
      <div className="mt-6">
        <h3 className="text-md font-medium text-gray-800 mb-2">
          Presupuestos Activos (mes actual)
        </h3>

        {budgets.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No hay presupuestos configurados
          </p>
        ) : (
          <ul className="space-y-2">
            {budgets.map((budget) => (
              <li
                key={budget.category}
                className="flex justify-between p-2 bg-gray-50 rounded border"
              >
                <span className="font-medium text-sm text-gray-700">
                  {budget.category}
                </span>
                <span className="text-sm text-blue-600">
                  ${budget.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;
