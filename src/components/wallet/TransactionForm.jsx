import React from "react";
import CategorySelector from "./CategorySelector";

/**
 * Formulario para agregar transacciones con estilos mejorados
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
    <div className="form-container">
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-grid">
          {/* Campo: Monto */}
          <div className="form-group">
            <label className="form-label">
              Monto <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">$</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="form-input with-icon"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="form-error">{errors.amount}</p>
            )}
          </div>

          {/* Campo: Tipo */}
          <div className="form-group">
            <label className="form-label">
              Tipo <span className="required">*</span>
            </label>
            <div className="toggle-container">
              <button 
                type="button"
                className={`toggle-button ${formData.type === 'income' ? 'active income' : ''}`}
                onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
              >
                <span className="toggle-icon">💰</span>
                <span>Ingreso</span>
              </button>
              <button 
                type="button"
                className={`toggle-button ${formData.type === 'expense' ? 'active expense' : ''}`}
                onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
              >
                <span className="toggle-icon">💸</span>
                <span>Gasto</span>
              </button>
            </div>
          </div>
        </div>

        <div className="form-grid">
          {/* Campo: Fecha */}
          <div className="form-group">
            <label className="form-label">
              Fecha <span className="required">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-input"
            />
            {errors.date && <p className="form-error">{errors.date}</p>}
          </div>

          {/* Campo: Descripción */}
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              placeholder="Ej: Compra supermercado"
            />
          </div>
        </div>

        {/* Campo: Categoría */}
        <div className="form-group category-group">
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
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
          >
            <span className="btn-icon">➕</span>
            Agregar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary"
          >
            <span className="btn-icon">🗑️</span>
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
