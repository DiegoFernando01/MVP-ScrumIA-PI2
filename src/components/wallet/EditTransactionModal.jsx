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
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Editar Transacción</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        
        <div className="modal-body">
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
                <span className="btn-icon">✓</span>
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
              >
                <span className="btn-icon">✕</span>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionModal;
