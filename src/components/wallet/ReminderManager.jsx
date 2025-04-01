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
    <div>
      {/* Mostrar alertas de recordatorios si hay */}
      {reminderAlerts && reminderAlerts.length > 0 && (
        <AlertDisplay
          activeAlerts={reminderAlerts}
          markAlertAsRead={markReminderAlertAsRead}
          dismissAlert={dismissReminderAlert}
        />
      )}

      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black">
            Recordatorios de Vencimiento
          </h2>

          {!isCreating && (
            <button
            onClick={handleCreateNew}
            className="btn-create"
          >
            Nuevo Recordatorio
          </button>
          )}
        </div>

        {isCreating ? (
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">
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
            <div className="mb-4 border-b pb-2">
              <div className="flex space-x-4">
              <button
                onClick={() => setFilterType("all")}
                className={`btn-filter btn-filter-all ${filterType === "all" ? "font-medium" : "text-gray-600 hover:bg-gray-100"}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType("active")}
                className={`btn-filter btn-filter-active ${filterType === "active" ? "font-medium" : "text-gray-600 hover:bg-gray-100"}`}
              >
                Activos
              </button>
              <button
                onClick={() => setFilterType("inactive")}
                className={`btn-filter btn-filter-inactive ${filterType === "inactive" ? "font-medium" : "text-gray-600 hover:bg-gray-100"}`}
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
