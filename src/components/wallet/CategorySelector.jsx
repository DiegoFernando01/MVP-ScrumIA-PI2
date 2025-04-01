import React from "react";

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
  // Determinar qué categorías mostrar según el tipo de transacción
  const categoriesForType =
    formData.type === "expense"
      ? categories.expense
      : categories.income;

  // Manejar click en "Agregar categoría"
  const handleAddCategoryClick = () => {
    setShowNewCategoryInput(true);
  };

  // Manejar cambio en el input de nueva categoría
  const handleNewCategoryChange = (e) => {
    setNewCategoryInput(e.target.value);
  };

  // Manejar creación de nueva categoría
  const handleCreateCategory = () => {
    if (newCategoryInput.trim()) {
      const success = addNewCategory(formData.type, newCategoryInput.trim());
      if (success) {
        setNewCategoryInput("");
        setShowNewCategoryInput(false);
      }
    }
  };

  // Manejar cancelación de creación de categoría
  const handleCancelNewCategory = () => {
    setNewCategoryInput("");
    setShowNewCategoryInput(false);
  };

  return (
    <>
      <label className="form-label">
        Categoría <span className="required">*</span>
      </label>
      
      {!showNewCategoryInput ? (
        <div className="category-selector">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Seleccionar categoría</option>
            {categoriesForType.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          <button
            type="button"
            onClick={handleAddCategoryClick}
            className="btn-add-category"
          >
            <span className="add-icon">+</span>
            <span>Nueva</span>
          </button>
        </div>
      ) : (
        <div className="new-category-input">
          <div className="input-with-icon">
            <span className="input-icon">🏷️</span>
            <input
              type="text"
              value={newCategoryInput}
              onChange={handleNewCategoryChange}
              placeholder="Nombre de la nueva categoría"
              className="form-input with-icon"
              autoFocus
            />
          </div>
          
          <div className="new-category-actions">
            <button
              type="button"
              onClick={handleCreateCategory}
              className="btn btn-sm btn-primary"
              disabled={!newCategoryInput.trim()}
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={handleCancelNewCategory}
              className="btn btn-sm btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      
      {errors.category && (
        <p className="form-error">{errors.category}</p>
      )}
    </>
  );
};

export default CategorySelector;
