import React from "react";
import CategorySelector from "./CategorySelector";

/**
 * Formulario para agregar transacciones
 */
const TransactionForm = ({
  formData,
  handleChange,
  handleSubmit,
  handleClear,
  errors,
  categories,
  newCategoryInput,
  setNewCategoryInput,
  showNewCategoryInput,
  setShowNewCategoryInput,
  addNewCategory,
}) => {
  return (
    <div>
      
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 rounded shadow"
      >
        <h2 className="text-xl text-black font-semibold text-center mb-4">
        Agregar Transacción
        </h2>
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
            Tipo *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-gray-800"
          >
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
        </div>

        {/* Campo: Fecha */}
        <div>
          <label className="block mb-1 text-sm font-medium text-black">
            Fecha *
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

        {/* Campo: Categoría */}
        <CategorySelector
          formData={formData}
          handleChange={handleChange}
          categories={categories}
          newCategoryInput={newCategoryInput}
          setNewCategoryInput={setNewCategoryInput}
          showNewCategoryInput={showNewCategoryInput}
          setShowNewCategoryInput={setShowNewCategoryInput}
          addNewCategory={addNewCategory}
          errors={errors}
        />

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
    </div>
  );
};

export default TransactionForm;
