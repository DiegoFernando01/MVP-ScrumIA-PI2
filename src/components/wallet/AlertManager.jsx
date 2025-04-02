import React, { useState } from "react";
import { 
  FaBell,
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaExclamationTriangle,
  FaSave, 
  FaTimes
} from "react-icons/fa";

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
    <div className="alert-manager">
      <div className="alert-manager-content">
        {!isEditing ? (
          <div>
            <button
              onClick={handleCreateNew}
              className="create-alert-btn"
            >
              <FaPlus /> Crear Nueva Alerta
            </button>

            {alertConfigs.length === 0 ? (
              <div className="alert-manager-empty">
                <div className="alert-manager-empty-icon">
                  <FaBell />
                </div>
                <p>No hay alertas configuradas</p>
                <p>Crea alertas para recibir notificaciones sobre el estado de tus presupuestos</p>
              </div>
            ) : (
              <ul className="alert-list">
                {alertConfigs.map((alert) => (
                  <li key={alert.id} className="alert-list-item">
                    <div className="alert-list-header">
                      <h3 className="alert-list-title">
                        {alert.name}
                      </h3>
                      <div className="alert-list-actions">
                        <label className="alert-toggle">
                          <input
                            type="checkbox"
                            checked={alert.enabled}
                            onChange={() =>
                              handleToggleAlert(alert.id, !alert.enabled)
                            }
                            className="alert-toggle-input"
                          />
                          <span className="alert-toggle-switch"></span>
                        </label>
                        <button
                          onClick={() => handleSelectAlert(alert)}
                          className="alert-btn"
                        >
                          <FaEdit /> Editar
                        </button>
                      </div>
                    </div>
                    <p className="alert-list-description">
                      {alert.type === "budget"
                        ? `Alerta de presupuesto al ${alert.criteria.thresholdPercentage}%`
                        : "Alerta personalizada"}
                      {alert.criteria.category &&
                        ` para ${alert.criteria.category}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="alert-form">
            <div className="form-group">
              <label className="form-label">
                Nombre de la alerta
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: Alerta de presupuesto de comida"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Tipo de alerta
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="budget">Alerta de presupuesto</option>
              </select>
            </div>

            {formData.type === "budget" && (
              <>
                <div className="form-group">
                  <label className="form-label">
                    Categoría (opcional)
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Umbral de alerta (% del presupuesto)
                  </label>
                  <select
                    name="thresholdPercentage"
                    value={formData.thresholdPercentage}
                    onChange={handleInputChange}
                    className="form-select"
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

            <div className="form-checkbox">
              <input
                type="checkbox"
                name="enabled"
                checked={formData.enabled}
                onChange={handleInputChange}
                id="alert-enabled"
              />
              <label htmlFor="alert-enabled">
                Alerta activada
              </label>
            </div>

            {error && (
              <div className="form-error">
                <FaExclamationTriangle /> {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="form-submit"
              >
                <FaSave /> {selectedAlert ? "Actualizar" : "Guardar"}
              </button>

              {selectedAlert && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="form-delete"
                >
                  <FaTrash /> Eliminar
                </button>
              )}

              <button
                type="button"
                onClick={handleCancel}
                className="form-cancel"
              >
                <FaTimes /> Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AlertManager;
