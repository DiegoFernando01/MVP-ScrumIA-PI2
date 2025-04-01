import React, { useState, useEffect } from "react";

/**
 * Componente de formulario para crear/editar recordatorios
 */
const ReminderForm = ({ reminder = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "one-time",
    dueDate: "",
    startDate: "",
    frequency: "monthly",
    description: "",
    category: "",
    alertDays: 7,
  });
  const [error, setError] = useState("");

  // Cargar datos si estamos editando un recordatorio existente
  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title || "",
        amount: reminder.amount || "",
        type: reminder.type || "one-time",
        dueDate: reminder.dueDate ? reminder.dueDate.substring(0, 10) : "",
        startDate: reminder.startDate
          ? reminder.startDate.substring(0, 10)
          : "",
        frequency: reminder.frequency || "monthly",
        description: reminder.description || "",
        category: reminder.category || "",
        alertDays: reminder.alertDays || 7,
      });
    }
  }, [reminder]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.title.trim()) {
      setError("El título es obligatorio");
      return;
    }

    if (formData.type === "one-time" && !formData.dueDate) {
      setError("La fecha de vencimiento es obligatoria");
      return;
    }

    if (formData.type === "recurring" && !formData.startDate) {
      setError("La fecha de inicio es obligatoria");
      return;
    }

    // Validar que la fecha sea futura
    if (formData.type === "one-time") {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

      if (dueDate < today) {
        setError("La fecha de vencimiento debe ser futura");
        return;
      }
    }

    if (formData.type === "recurring") {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        setError("La fecha de inicio debe ser hoy o futura");
        return;
      }
    }

    // Preparar datos para enviar
    const reminderData = {
      ...formData,
      alertDays: parseInt(formData.alertDays, 10),
    };

    // Si tenemos un ID, incluirlo para actualizar
    if (reminder && reminder.id) {
      reminderData.id = reminder.id;
    }

    // Enviar al componente padre
    onSubmit(reminderData);
  };

  // Obtener fecha mínima (hoy) para validación
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <form onSubmit={handleSubmit} className="reminder-form">
      <div>
        <label className="block mb-1 text-sm font-medium text-black">
          Título *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded text-gray-800"
          placeholder="Ej: Pago de luz"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-black">
          Monto
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded text-gray-800"
          placeholder="Ej: 1500.00"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-black">
          Tipo de recordatorio *
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded text-gray-800"
        >
          <option value="one-time">Único</option>
          <option value="recurring">Recurrente</option>
        </select>
      </div>

      {formData.type === "one-time" ? (
        <div>
          <label className="block mb-1 text-sm font-medium text-black">
            Fecha de vencimiento *
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            min={getTodayString()}
            className="w-full px-3 py-2 border rounded text-gray-800"
          />
        </div>
      ) : (
        <>
          <div>
            <label className="block mb-1 text-sm font-medium text-black">
              Fecha de inicio *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={getTodayString()}
              className="w-full px-3 py-2 border rounded text-gray-800"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-black">
              Frecuencia
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded text-gray-800"
            >
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quincenal</option>
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        </>
      )}

      <div>
        <label className="block mb-1 text-sm font-medium text-black">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded text-gray-800"
          rows="2"
          placeholder="Información adicional..."
        ></textarea>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-black">
          Categoría
        </label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded text-gray-800"
          placeholder="Ej: Servicios, Préstamos"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-black">
          Alertar con anticipación (días)
        </label>
        <select
          name="alertDays"
          value={formData.alertDays}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded text-gray-800"
        >
          <option value="1">1 día antes</option>
          <option value="3">3 días antes</option>
          <option value="5">5 días antes</option>
          <option value="7">7 días antes</option>
          <option value="14">14 días antes</option>
          <option value="30">30 días antes</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="reminder-actions">
        <button
          type="submit"
          className="reminder-btn-save"
        >
          {reminder ? "Actualizar" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="reminder-btn-cancel"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ReminderForm;
