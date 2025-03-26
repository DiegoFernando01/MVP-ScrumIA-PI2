import React from "react";

/**
 * Selector de categorías con opción para añadir nuevas
 */
const CategorySelector = ({
  formData,
  handleChange,
  categories,
  newCategoryInput,
  setNewCategoryInput,
  showNewCategoryInput,
  setShowNewCategoryInput,
  addNewCategory,
  errors,
}) => {
  const handleAddCategory = () => {
    if (!newCategoryInput.trim()) return;

    const success = addNewCategory(formData.type, newCategoryInput);
    if (!success) {
      alert("Esta categoría ya existe");
      return;
    }

    // Limpiar y ocultar el input
    setNewCategoryInput("");
    setShowNewCategoryInput(false);
  };

  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-black">
        Categoría *
      </label>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-l text-gray-800"
          >
            <option value="">Seleccionar categoría</option>
            {categories[formData.type]?.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
            className="bg-gray-100 hover:bg-gray-200 px-3 py-2 border-y border-r rounded-r"
            title="Agregar nueva categoría"
          >
            {showNewCategoryInput ? "✕" : "+"}
          </button>
        </div>

        {/* Input para nueva categoría */}
        {showNewCategoryInput && (
          <div className="flex mt-1">
            <input
              type="text"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              placeholder="Nombre de nueva categoría"
              className="flex-grow px-3 py-2 border rounded-l text-gray-800"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r"
            >
              Agregar
            </button>
          </div>
        )}
        {errors?.category && (
          <p className="text-red-500 text-xs">{errors.category}</p>
        )}
      </div>
    </div>
  );
};

export default CategorySelector;
