import React from "react";

/**
 * Componente para mostrar lista de recordatorios
 */
const ReminderList = ({
  reminders,
  onEdit,
  onDelete,
  onToggleStatus,
  getNextDueDate,
}) => {
  // Formato para mostrar fechas
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Obtener texto para mostrar la frecuencia
  const getFrequencyText = (frequency) => {
    const options = {
      weekly: "Semanal",
      biweekly: "Quincenal",
      monthly: "Mensual",
      quarterly: "Trimestral",
      yearly: "Anual",
    };
    return options[frequency] || frequency;
  };

  // Formato para días restantes
  const getDaysRemainingText = (daysRemaining) => {
    if (daysRemaining === 0) return "¡Vence hoy!";
    if (daysRemaining === 1) return "¡Vence mañana!";
    return `${daysRemaining} días restantes`;
  };

  // Obtener estilo según los días restantes
  const getCardStyle = (daysRemaining) => {
    if (daysRemaining <= 1) return "reminder-urgent";
    if (daysRemaining <= 3) return "reminder-warning";
    if (daysRemaining <= 7) return "reminder-attention";
    return "reminder-normal";
  };

  // Procesar recordatorios para mostrar días restantes y próxima fecha
  const processedReminders = reminders
    .map((reminder) => {
      const today = new Date();
      const nextDueDate = getNextDueDate(reminder);

      let daysRemaining = 0;
      if (nextDueDate) {
        daysRemaining = Math.ceil(
          (nextDueDate - today) / (1000 * 60 * 60 * 24)
        );
      }

      return {
        ...reminder,
        nextDueDate,
        daysRemaining,
        formattedNextDueDate: nextDueDate ? formatDate(nextDueDate) : "N/A",
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  if (processedReminders.length === 0) {
    return (
      <div className="reminder-empty">
        No hay recordatorios configurados
      </div>
    );
  }

  return (
    <ul className="reminder-list">
      {processedReminders.map((reminder) => (
        <li
          key={reminder.id}
          className={`reminder-item ${getCardStyle(reminder.daysRemaining)}`}
        >
          <div className="reminder-item-content">
            <div className="reminder-item-header">
              <div className="reminder-item-info">
                <h3 className="reminder-item-title">{reminder.title}</h3>

                <div className="reminder-item-badge-container">
                  <span
                    className={`reminder-badge ${
                      reminder.daysRemaining <= 3
                        ? "reminder-badge-urgent"
                        : reminder.daysRemaining <= 7
                        ? "reminder-badge-warning"
                        : "reminder-badge-normal"
                    }`}
                  >
                    {getDaysRemainingText(reminder.daysRemaining)}
                  </span>
                </div>

                <p className="reminder-item-date">
                  {reminder.type === "one-time" ? (
                    <span>Vence: {reminder.formattedNextDueDate}</span>
                  ) : (
                    <span>
                      Próximo vencimiento: {reminder.formattedNextDueDate} (
                      {getFrequencyText(reminder.frequency)})
                    </span>
                  )}
                </p>

                {reminder.amount && (
                  <p className="reminder-item-amount">
                    Monto: ${parseFloat(reminder.amount).toFixed(2)}
                  </p>
                )}

                {reminder.description && (
                  <p className="reminder-description">
                    {reminder.description}
                  </p>
                )}

                {reminder.category && (
                  <p className="reminder-item-category">
                    Categoría: {reminder.category}
                  </p>
                )}
              </div>

              <div className="reminder-toggle-container">
                <label className="reminder-toggle">
                  <input
                    type="checkbox"
                    checked={reminder.active}
                    onChange={() =>
                      onToggleStatus(reminder.id, !reminder.active)
                    }
                    className="reminder-toggle-input"
                  />
                  <div className="reminder-toggle-switch"></div>
                </label>
              </div>
            </div>

            <div className="reminder-item-actions">
              <button
                onClick={() => onEdit(reminder)}
                className="btn-reminder edit"
              >
                ✏️ Editar
              </button>

              <button
                onClick={() => onDelete(reminder.id)}
                className="btn-reminder delete"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ReminderList;
