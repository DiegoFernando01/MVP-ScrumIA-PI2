import React, { useState } from "react";

/**
 * Componente para administrar categorías
 */
const CategoryManager = ({ categories, removeCategory, currentType }) => {
  const [activeTab, setActiveTab] = useState(currentType || "income");

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2 text-black">
        Administrar Categorías
      </h2>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setActiveTab("income")}
          className={`px-3 py-1 rounded ${
            activeTab === "income" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Ingresos
        </button>
        <button
          onClick={() => setActiveTab("expense")}
          className={`px-3 py-1 rounded ${
            activeTab === "expense" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Gastos
        </button>
      </div>

      {/* Categorías de ingresos */}
      {activeTab === "income" && (
        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-800 mb-2">
            Categorías de Ingresos
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.income.map((cat) => (
              <div
                key={cat}
                className="bg-green-100 text-sm px-2 py-1 rounded flex items-center text-black"
              >
                <span>{cat}</span>
                <button
                  onClick={() => removeCategory("income", cat)}
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
      )}

      {/* Categorías de gastos */}
      {activeTab === "expense" && (
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-2">
            Categorías de Gastos
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.expense.map((cat) => (
              <div
                key={cat}
                className="bg-red-100 text-sm px-2 py-1 rounded flex items-center text-black"
              >
                <span>{cat}</span>
                <button
                  onClick={() => removeCategory("expense", cat)}
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
      )}
    </div>
  );
};

export default CategoryManager;
