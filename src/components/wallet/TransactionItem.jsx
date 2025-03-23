import React from "react";

/**
 * Componente para mostrar una transacción individual
 */
const TransactionItem = ({ transaction }) => {
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
    </li>
  );
};

export default TransactionItem;
