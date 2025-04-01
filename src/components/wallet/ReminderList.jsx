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
    if (daysRemaining <= 1) return "border-l-4 border-l-red-500 bg-red-50";
    if (daysRemaining <= 3) return "border-l-4 border-l-orange-500 bg-orange-50";
    if (daysRemaining <= 7) return "border-l-4 border-l-yellow-500 bg-yellow-50";
    return "border-l-4 border-l-blue-500 bg-blue-50";
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
      <div className="flex flex-col items-center justify-center p-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="text-5xl mb-4">📅</div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No hay recordatorios configurados</h3>
        <p className="text-gray-500">Crea un nuevo recordatorio para gestionar tus vencimientos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {processedReminders.map((reminder) => (
        <div
          key={reminder.id}
          className={`rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${getCardStyle(
            reminder.daysRemaining
          )}`}
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-semibold text-gray-800 text-lg">{reminder.title}</h3>
                  <div className="ml-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        reminder.daysRemaining <= 1
                          ? "bg-red-100 text-red-800"
                          : reminder.daysRemaining <= 3
                          ? "bg-orange-100 text-orange-800"
                          : reminder.daysRemaining <= 7
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {getDaysRemainingText(reminder.daysRemaining)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  {reminder.type === "one-time" ? (
                    <div className="flex items-center">
                      <span className="mr-1">🗓️</span>
                      <span>Vence: {reminder.formattedNextDueDate}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-1">🔄</span>
                      <span>
                        Próximo vencimiento: {reminder.formattedNextDueDate} (
                        {getFrequencyText(reminder.frequency)})
                      </span>
                    </div>
                  )}
                </div>

                {reminder.amount && (
                  <div className="mt-1.5 flex items-center text-gray-700">
                    <span className="mr-1">💰</span>
                    <span className="font-medium">
                      ${parseFloat(reminder.amount).toFixed(2)}
                    </span>
                  </div>
                )}

                {reminder.description && (
                  <div className="mt-1.5 text-sm text-gray-600">
                    <p className="italic">{reminder.description}</p>
                  </div>
                )}

                {reminder.category && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {reminder.category}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <label className="relative inline-flex items-center mr-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminder.active}
                    onChange={() => onToggleStatus(reminder.id, !reminder.active)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => onEdit(reminder)}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                style={{ backgroundColor: 'rgb(243 232 255)' }}
              >
                <span className="mr-1">✏️</span> Editar
              </button>
              <button
                onClick={() => onDelete(reminder.id)}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                style={{ backgroundColor: 'rgb(254 226 226)' }}
              >
                <span className="mr-1">🗑️</span> Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReminderList;
