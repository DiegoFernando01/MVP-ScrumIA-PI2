import React from "react";

/**
 * Componente para mostrar indicador de presupuesto en transacciones
 */
const BudgetIndicator = ({ budgetUsage }) => {
  const {
    hasbudget,
    percentage,
    isOverBudget,
    isApproachingLimit,
    totalExpenses,
    budgetAmount,
  } = budgetUsage;

  if (!hasbudget) {
    return null; // No mostrar nada si no hay presupuesto
  }

  // Determinar color del indicador según el porcentaje
  let statusColor = "bg-green-500";
  if (isOverBudget) {
    statusColor = "bg-red-500";
  } else if (isApproachingLimit) {
    statusColor = "bg-yellow-500";
  } else if (percentage > 70) {
    statusColor = "bg-orange-400";
  } else if (percentage > 50) {
    statusColor = "bg-blue-400";
  }

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">
          Presupuesto: ${budgetAmount.toFixed(2)}
        </span>
        <span
          className={`font-medium ${
            isOverBudget
              ? "text-red-600"
              : isApproachingLimit
              ? "text-yellow-600"
              : "text-gray-600"
          }`}
        >
          {percentage.toFixed(0)}% usado
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${statusColor} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>

      {/* Alerta si se acerca o supera el límite */}
      {isApproachingLimit && (
        <p className="text-yellow-600 text-xs mt-1">
          ⚠️ Te estás acercando al límite de tu presupuesto
        </p>
      )}

      {isOverBudget && (
        <p className="text-red-600 text-xs mt-1">
          ⚠️ Has excedido tu presupuesto mensual por $
          {(totalExpenses - budgetAmount).toFixed(2)}
        </p>
      )}
    </div>
  );
};

export default BudgetIndicator;
