import React from "react";
import BudgetIndicator from "./BudgetIndicator";

/**
 * Componente para mostrar una transacción individual
 */
const TransactionItem = ({ transaction, budgetUsage }) => {
  const { type, description, amount, date, category } = transaction;

  return (
    <li
      className={`p-3 rounded shadow text-sm ${
        type === "income" ? "bg-green-300" : "bg-red-300"
      }`}
    >
      <div className="flex justify-between text-black">
        <span>{description || "Sin descripción"}</span>
        <span className="font-semibold">
          {type === "income" ? "+" : "-"}${parseFloat(amount).toFixed(2)}
        </span>
      </div>
      <div className="text-xs text-gray-600">
        {date} • {category || "Sin categoría"}
      </div>

      {/* Mostrar indicador de presupuesto solo para gastos con categoría y presupuesto configurado */}
      {type === "expense" && category && budgetUsage && (
        <BudgetIndicator budgetUsage={budgetUsage} />
      )}
    </li>
  );
};

export default TransactionItem;
