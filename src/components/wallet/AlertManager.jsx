import React, { useState } from "react";

/**
 * Componente para gestionar alertas personalizadas
 */
const AlertManager = ({
  alertConfigs,
  saveAlertConfig,
  removeAlertConfig,
  toggleAlertConfig,
  categories,
}) => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "budget",
    category: "",
    thresholdPercentage: 90,
    enabled: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError("");
  };

  const handleSelectAlert = (alert) => {
    setSelectedAlert(alert);
    setFormData({
      name: alert.name,
      type: alert.type,
      category: alert.criteria.category || "",
      thresholdPercentage: alert.criteria.thresholdPercentage || 90,
      enabled: alert.enabled,
    });
    setIsEditing(true);
    setError("");
  };

  const handleCreateNew = () => {
    setSelectedAlert(null);
    setFormData({
      name: "",
      type: "budget",
      category: "",
      thresholdPercentage: 90,
      enabled: true,
    });
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedAlert(null);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Debes asignar un nombre a la alerta");
      return;
    }

    // Crear objeto de alerta
    const alertConfig = {
      id: selectedAlert?.id,
      name: formData.name.trim(),
      type: formData.type,
      criteria: {
        thresholdPercentage: parseInt(formData.thresholdPercentage, 10),
      },
      enabled: formData.enabled,
    };

    // Agregar categoría si se seleccionó y es necesaria
    if (formData.type === "budget" && formData.category) {
      alertConfig.criteria.category = formData.category;
    }

    // Guardar configuración
    saveAlertConfig(alertConfig);

    // Restablecer formulario
    setIsEditing(false);
    setSelectedAlert(null);
    setError("");
  };

  const handleDelete = () => {
    if (selectedAlert) {
      removeAlertConfig(selectedAlert.id);
      setIsEditing(false);
      setSelectedAlert(null);
    }
  };

  const handleToggleAlert = (alertId, enabled) => {
    toggleAlertConfig(alertId, enabled);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4 text-black">
        Configuración de Alertas
      </h2>

      {!isEditing ? (
        <div>
          <button
            onClick={handleCreateNew}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Crear Nueva Alerta
          </button>

          {alertConfigs.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay alertas configuradas</p>
          ) : (
            <ul className="space-y-2">
              {alertConfigs.map((alert) => (
                <li key={alert.id} className="p-3 bg-gray-50 rounded border">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {alert.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {alert.type === "budget"
                          ? `Alerta de presupuesto al ${alert.criteria.thresholdPercentage}%`
                          : "Alerta personalizada"}
                        {alert.criteria.category &&
                          ` para ${alert.criteria.category}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alert.enabled}
                          onChange={() =>
                            handleToggleAlert(alert.id, !alert.enabled)
                          }
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <button
                        onClick={() => handleSelectAlert(alert)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-black">
              Nombre de la alerta
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded text-gray-800"
              placeholder="Ej: Alerta de presupuesto de comida"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-black">
              Tipo de alerta
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded text-gray-800"
            >
              <option value="budget">Alerta de presupuesto</option>
            </select>
          </div>

          {formData.type === "budget" && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium text-black">
                  Categoría (opcional)
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded text-gray-800"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-black">
                  Umbral de alerta (% del presupuesto)
                </label>
                <select
                  name="thresholdPercentage"
                  value={formData.thresholdPercentage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded text-gray-800"
                >
                  <option value="70">70% del presupuesto</option>
                  <option value="80">80% del presupuesto</option>
                  <option value="90">90% del presupuesto</option>
                  <option value="95">95% del presupuesto</option>
                  <option value="100">
                    100% del presupuesto (límite alcanzado)
                  </option>
                </select>
              </div>
            </>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              name="enabled"
              checked={formData.enabled}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Alerta activada
            </label>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {selectedAlert ? "Actualizar" : "Guardar"}
            </button>

            {selectedAlert && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
              >
                Eliminar
              </button>
            )}

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AlertManager;
