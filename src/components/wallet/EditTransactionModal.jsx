import React, { useState, useEffect } from "react";
import CategorySelector from "./CategorySelector";

/**
 * Modal para editar una transacción existente
 */
const EditTransactionModal = ({
  transaction,
  onSave,
  onCancel,
  categories,
  newCategoryInput,
  setNewCategoryInput,
  showNewCategoryInput,
  setShowNewCategoryInput,
  addNewCategory,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    type: "income",
    date: "",
    description: "",
    category: "",
  });
  const [errors, setErrors] = useState({});

  // Cargar datos de la transacción al abrir el modal
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        description: transaction.description || "",
        category: transaction.category || "",
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Resetear categoría cuando cambia el tipo
    if (name === "type") {
      setFormData({
        ...formData,
        [name]: value,
        category: "", // Resetear categoría
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      Number(formData.amount) <= 0
    ) {
      newErrors.amount = "El monto debe ser un número mayor a cero.";
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      newErrors.date = "La fecha debe tener el formato YYYY-MM-DD.";
    }

    if (!formData.category) {
      newErrors.category = "Debe seleccionar una categoría.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Guardar cambios manteniendo el ID original
    onSave({ ...formData, id: transaction.id });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 text-white">
          <h3 className="text-lg font-medium">Editar Transacción</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            {errors.date && (
              <p className="text-red-500 text-xs">{errors.date}</p>
            )}
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
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
