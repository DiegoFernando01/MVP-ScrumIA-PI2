/**
 * Valida los datos de una transacción
 * @param {Object} formData - Datos del formulario de transacción
 * @returns {Object} Errores de validación encontrados
 */
export const validateTransaction = (formData) => {
  const errors = {};

  // Validar monto
  if (
    !formData.amount ||
    isNaN(formData.amount) ||
    Number(formData.amount) <= 0
  ) {
    errors.amount = "El monto debe ser un número mayor a cero.";
  }

  // Validar fecha
  if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
    errors.date = "La fecha debe tener el formato YYYY-MM-DD.";
  }

  // Validar categoría
  if (!formData.category) {
    errors.category = "Debe seleccionar una categoría.";
  }

  return errors;
};

export default validateTransaction;
