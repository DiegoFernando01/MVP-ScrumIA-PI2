import React, { useState } from "react";
import ReminderForm from "./ReminderForm";
import ReminderList from "./ReminderList";
import AlertDisplay from "./AlertDisplay";

/**
 * Componente para gestionar recordatorios de vencimiento
 */
const ReminderManager = ({ reminderHook }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filterType, setFilterType] = useState("all"); // all, active, inactive

  const {
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminderStatus,
    getNextDueDate,
    reminders,
    reminderAlerts,
    markReminderAlertAsRead,
    dismissReminderAlert,
  } = reminderHook;

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingReminder(null);
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingReminder(null);
  };

  const handleDelete = (id) => {
    if (
      window.confirm("¿Estás seguro que deseas eliminar este recordatorio?")
    ) {
      deleteReminder(id);
    }
  };

  const handleSubmit = async (reminderData) => {
    let result;

    if (editingReminder) {
      result = await updateReminder(editingReminder.id, reminderData);
      if (!result.success) {
        alert(result.error || "Error al actualizar el recordatorio");
        return;
      }
    } else {
      result = await addReminder(reminderData);
      if (!result.success) {
        alert(result.error || "Error al crear el recordatorio");
        return;
      }
    }

    setIsCreating(false);
    setEditingReminder(null);
  };

  // Filtrar recordatorios según el tipo seleccionado
  const filteredReminders = reminders.filter((reminder) => {
    if (filterType === "active") return reminder.active;
    if (filterType === "inactive") return !reminder.active;
    return true; // "all"
  });

  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6 rounded-lg shadow-lg">
      {/* Mostrar alertas de recordatorios si hay */}
      {reminderAlerts && reminderAlerts.length > 0 && (
        <AlertDisplay
          activeAlerts={reminderAlerts}
          markAlertAsRead={markReminderAlertAsRead}
          dismissAlert={dismissReminderAlert}
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-700">
            Recordatorios de Vencimiento
          </h2>

          {!isCreating && (
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium shadow-md !important"
              style={{ backgroundColor: 'transparent' }}
            >
              Nuevo Recordatorio
            </button>
          )}
        </div>

        {isCreating ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingReminder ? "Editar Recordatorio" : "Nuevo Recordatorio"}
            </h3>
            <ReminderForm
              reminder={editingReminder}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div>
            {/* Filtros */}
            <div className="mb-6 border-b pb-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1 text-sm rounded-lg shadow-md transition-all font-medium ${
                    filterType === "all"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={{ backgroundColor: filterType === "all" ? "rgb(243 232 255)" : "rgb(243 244 246)" }}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType("active")}
                  className={`px-3 py-1 text-sm rounded-lg shadow-md transition-all font-medium ${
                    filterType === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={{ backgroundColor: filterType === "active" ? "rgb(220 252 231)" : "rgb(243 244 246)" }}
                >
                  Activos
                </button>
                <button
                  onClick={() => setFilterType("inactive")}
                  className={`px-3 py-1 text-sm rounded-lg shadow-md transition-all font-medium ${
                    filterType === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={{ backgroundColor: filterType === "inactive" ? "rgb(254 226 226)" : "rgb(243 244 246)" }}
                >
                  Inactivos
                </button>
              </div>
            </div>

            {/* Lista de recordatorios */}
            <ReminderList
              reminders={filteredReminders}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={toggleReminderStatus}
              getNextDueDate={getNextDueDate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderManager;
