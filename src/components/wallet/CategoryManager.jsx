import React, { useState } from "react";

/**
 * Componente para administrar categorías
 */
const CategoryManager = ({
  categories,
  removeCategory,
  currentType,
  addCategory,
}) => {
  const [activeTab, setActiveTab] = useState(currentType || "income");
  const [newCatInput, setNewCatInput] = useState("");

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;

    const success = addCategory(activeTab, newCatInput.trim());
    if (!success) {
      alert("La categoría ya existe o es inválida.");
      return;
    }

    setNewCatInput("");
  };

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

      <div>
        <h3 className="text-md font-medium text-gray-800 mb-2">
          Categorías de {activeTab === "income" ? "Ingresos" : "Gastos"}
        </h3>

        {/* Listado de categorías */}
        <div className="flex flex-wrap gap-2 mb-3">
          {categories[activeTab].map((cat) => (
            <div
              key={cat}
              className={`${
                activeTab === "income"
                  ? "bg-green-100"
                  : "bg-red-100"
              } text-sm px-2 py-1 rounded flex items-center text-black`}
            >
              <span>{cat}</span>
              <button
                onClick={() => removeCategory(activeTab, cat)}
                className="ml-2 text-red-500 hover:text-red-700"
                disabled={
                  (activeTab === "income" && cat === "Otros ingresos") ||
                  (activeTab === "expense" && cat === "Otros gastos")
                }
                title={
                  (activeTab === "income" && cat === "Otros ingresos") ||
                  (activeTab === "expense" && cat === "Otros gastos")
                    ? "No se puede eliminar esta categoría"
                    : "Eliminar categoría"
                }
              >
                {(cat !== "Otros ingresos" && cat !== "Otros gastos") && "×"}
              </button>
            </div>
          ))}
        </div>

        {/* Agregar nueva categoría */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            placeholder="Nueva categoría"
            className="border px-2 py-1 rounded text-sm flex-grow"
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
