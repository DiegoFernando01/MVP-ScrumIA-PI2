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
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo: Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">📝</span>
            </div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Ej: Pago de luz"
            />
          </div>
        </div>

        {/* Campo: Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Ej: 1500.00"
            />
          </div>
        </div>

        {/* Campo: Tipo de recordatorio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de recordatorio <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div 
              className={`cursor-pointer border ${
                formData.type === "one-time" 
                  ? "bg-purple-50 border-purple-500 text-purple-800" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              } rounded-md p-3 text-center transition-all`}
              onClick={() => handleInputChange({ target: { name: 'type', value: 'one-time' } })}
            >
              <div className="text-xl mb-1">🗓️</div>
              <div className="text-sm font-medium">Único</div>
            </div>
            <div 
              className={`cursor-pointer border ${
                formData.type === "recurring" 
                  ? "bg-purple-50 border-purple-500 text-purple-800" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              } rounded-md p-3 text-center transition-all`}
              onClick={() => handleInputChange({ target: { name: 'type', value: 'recurring' } })}
            >
              <div className="text-xl mb-1">🔄</div>
              <div className="text-sm font-medium">Recurrente</div>
            </div>
          </div>
        </div>

        {/* Campos según el tipo seleccionado */}
        {formData.type === "one-time" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de vencimiento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">📅</span>
              </div>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                min={getTodayString()}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">📅</span>
                </div>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={getTodayString()}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">🔄</span>
                </div>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-no-repeat"
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundPosition: "right 0.5rem center", backgroundSize: "0.8em auto" }}
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Campo: Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <span className="text-gray-500">📝</span>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              rows="2"
              placeholder="Información adicional..."
            ></textarea>
          </div>
        </div>

        {/* Campo: Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">🏷️</span>
            </div>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Ej: Servicios, Préstamos"
            />
          </div>
        </div>

        {/* Campo: Alertar con anticipación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alertar con anticipación (días)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">🔔</span>
            </div>
            <select
              name="alertDays"
              value={formData.alertDays}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-no-repeat"
              style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundPosition: "right 0.5rem center", backgroundSize: "0.8em auto" }}
            >
              <option value="1">1 día antes</option>
              <option value="3">3 días antes</option>
              <option value="5">5 días antes</option>
              <option value="7">7 días antes</option>
              <option value="14">14 días antes</option>
              <option value="30">30 días antes</option>
            </select>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-500">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-md"
            style={{ backgroundColor: 'transparent', color: 'white' }}
          >
            {reminder ? "Actualizar Recordatorio" : "Guardar Recordatorio"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
            style={{ backgroundColor: 'rgb(243 244 246)', color: 'rgb(31 41 55)' }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm;
