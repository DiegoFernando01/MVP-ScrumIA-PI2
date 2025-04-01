import React from "react";

/**
 * Componente que representa un ítem de transacción individual
 */
const TransactionItem = ({
  transaction,
  calculateBudgetUsage,
  onEdit,
  onDelete,
}) => {
  const { id, type, category, amount, date, description } = transaction;

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Determinar si mostrar indicador de presupuesto para categorías de gasto
  const showBudgetIndicator = type === "expense" && category;

  // Obtener porcentaje de uso del presupuesto si aplica
  let budgetPercentage = 0;
  if (showBudgetIndicator && typeof calculateBudgetUsage === "function") {
    const usage = calculateBudgetUsage(category);
    budgetPercentage = usage?.percentage || 0;
  }

  // Determinar clase CSS basada en el porcentaje de uso
  const getBudgetStatusClass = () => {
    if (budgetPercentage < 70) return "status-safe";
    if (budgetPercentage < 90) return "status-warning";
    return "status-danger";
  };

  return (
    <div className="transaction-item">
      <div className={`transaction-icon ${type}`}>
        {type === "income" ? "💰" : "💸"}
      </div>
      
      <div className="transaction-details">
        <h4 className="transaction-category">{category || "Sin categoría"}</h4>
        <div className="transaction-info">
          <span className="transaction-date">{formatDate(date)}</span>
          {description && (
            <span className="transaction-description">{description}</span>
          )}
        </div>
        
        {showBudgetIndicator && budgetPercentage > 0 && (
          <div className="usage-indicator">
            <div className="usage-bar">
              <div 
                className={`usage-progress ${getBudgetStatusClass()}`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              ></div>
            </div>
            <span className={`usage-text ${getBudgetStatusClass()}`}>
              {budgetPercentage.toFixed(0)}% del presupuesto
            </span>
          </div>
        )}
      </div>
      
      <div className={`transaction-amount ${type === "income" ? "amount-income" : "amount-expense"}`}>
        $ {parseFloat(amount).toFixed(2)}
      </div>
      
      <div className="transaction-actions">
        <button
          className="action-btn edit"
          onClick={onEdit}
          title="Editar transacción"
        >
          ✏️
        </button>
        <button
          className="action-btn delete"
          onClick={onDelete}
          title="Eliminar transacción"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;
