import React from "react";
import BudgetIndicator from "./BudgetIndicator";

/**
 * Componente para mostrar una transacción individual
 */
const TransactionItem = ({ transaction, budgetUsage, onEdit, onDelete }) => {
  const { type, description, amount, date, category } = transaction;

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro que deseas eliminar esta transacción?")) {
      onDelete(transaction.id);
    }
  };

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

      {/* Controles para editar/eliminar */}
      <div className="flex justify-end space-x-2 mt-2">
        <button
          onClick={() => onEdit(transaction)}
          className="text-xs text-blue-700 hover:text-blue-900"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="text-xs text-red-700 hover:text-red-900"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
};

export default TransactionItem;
