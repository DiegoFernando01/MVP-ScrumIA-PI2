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
    if (daysRemaining <= 1) return "bg-red-100 border-red-300";
    if (daysRemaining <= 3) return "bg-orange-100 border-orange-300";
    if (daysRemaining <= 7) return "bg-yellow-100 border-yellow-300";
    return "bg-blue-50 border-blue-200";
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
      <div className="text-center py-4 text-gray-500">
        No hay recordatorios configurados
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {processedReminders.map((reminder) => (
        <li
          key={reminder.id}
          className={`border rounded-lg overflow-hidden shadow-sm ${getCardStyle(
            reminder.daysRemaining
          )}`}
        >
          <div className="p-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-800">{reminder.title}</h3>

                <div className="flex items-center mt-1">
                  <span
                    className={`text-sm font-medium px-2 py-0.5 rounded ${
                      reminder.daysRemaining <= 3
                        ? "bg-red-200 text-red-800"
                        : reminder.daysRemaining <= 7
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-blue-200 text-blue-800"
                    }`}
                  >
                    {getDaysRemainingText(reminder.daysRemaining)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-1">
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
                  <p className="text-sm font-medium mt-1">
                    Monto: ${parseFloat(reminder.amount).toFixed(2)}
                  </p>
                )}

                {reminder.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {reminder.description}
                  </p>
                )}

                {reminder.category && (
                  <p className="text-xs text-gray-500 mt-1">
                    Categoría: {reminder.category}
                  </p>
                )}
              </div>

              <div className="flex space-x-1">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminder.active}
                    onChange={() =>
                      onToggleStatus(reminder.id, !reminder.active)
                    }
                    className="sr-only peer"
                  />
                  <div className="relative w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-2">
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
