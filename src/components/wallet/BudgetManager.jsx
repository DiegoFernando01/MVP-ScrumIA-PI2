import React, { useState } from "react";
import "../../styles/components/wallet/Budget.css";

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

  // Función para eliminar presupuesto directamente desde la lista
  const handleDeleteFromList = (category) => {
    const success = removeBudgetForCategory(category);
    if (!success) {
      setError("No se pudo eliminar el presupuesto");
    }
  };

  return (
    <div className="budget-container">
      <div className="budget-form-card">
        <h2 className="budget-form-title">
          <span className="budget-icon">💰</span> Presupuestos por Categoría
        </h2>

        <form onSubmit={handleSubmit} className="budget-form">
          {/* Selector de categoría */}
          <div className="budget-form-field">
            <label className="budget-form-label">
              <span className="budget-form-label-icon">📋</span> Categoría de gasto
            </label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="budget-form-select"
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
          <div className="budget-form-field">
            <label className="budget-form-label">
              <span className="budget-form-label-icon">💵</span> Presupuesto mensual
            </label>
            <div className="budget-amount-input-wrapper">
              <span className="budget-currency-symbol">$</span>
              <input
                type="number"
                value={budgetAmount}
                onChange={handleAmountChange}
                placeholder="Ej: 1000.00"
                className="budget-form-input"
              />
            </div>
          </div>

          {/* Mensaje de error */}
          {error && <p className="budget-form-error">{error}</p>}

          {/* Botones de acción */}
          <div className="budget-form-actions">
            <button
              type="submit"
              className="budget-save-btn"
            >
              <span className="button-icon">✓</span> Guardar Presupuesto
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="budget-delete-btn"
              disabled={
                !selectedCategory ||
                !budgets.some((b) => b.category === selectedCategory)
              }
            >
              <span className="button-icon">✕</span> Eliminar
            </button>
          </div>
        </form>
      </div>

      {/* Lista de presupuestos actuales */}
      <div className="budget-list-container">
        <h3 className="budget-list-title">
          <span className="budget-icon">📊</span> Presupuestos Activos (mes actual)
        </h3>

        {budgets.length === 0 ? (
          <div className="empty-budget-message">
            <div className="empty-budget-icon">📈</div>
            <p>No hay presupuestos configurados</p>
            <p className="empty-budget-hint">Configura presupuestos para controlar tus gastos</p>
          </div>
        ) : (
          <ul className="budget-items-list">
            {budgets.map((budget) => (
              <li
                key={budget.category}
                className="budget-list-item"
              >
                <div className="budget-item-category">
                  <span className="category-icon">📌</span>
                  <span>{budget.category}</span>
                </div>
                <div className="budget-item-right">
                  <div className="budget-item-amount">
                    ${budget.amount.toFixed(2)}
                  </div>
                  <button 
                    type="button"
                    className="budget-item-delete-btn"
                    onClick={() => handleDeleteFromList(budget.category)}
                    title="Eliminar presupuesto"
                  >
                    <span className="delete-icon">×</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;
