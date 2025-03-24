import { useState, useEffect } from "react";
import {
  saveReminder,
  getReminders,
  updateReminder as updateReminderInDB,
  deleteReminder as deleteReminderFromDB,
} from "../services/reminderService";
import { auth } from "../services/firebaseConfig";

/**
 * Hook personalizado para gestionar recordatorios de vencimientos
 * @returns {Object} Métodos y estados para manejar recordatorios
 */
const useReminders = () => {
  // Estado para almacenar recordatorios
  const [reminders, setReminders] = useState([]);
  // Estado para alertas de recordatorios activos
  const [reminderAlerts, setReminderAlerts] = useState([]);

  // Cargar recordatorios guardados al iniciar
  useEffect(() => {
    const fetchReminders = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      const res = await getReminders(user.uid);
      if (res.success) {
        setReminders(res.reminders);
      }
    };
  
    fetchReminders();
  }, []);
  
  // Verificar recordatorios próximos periódicamente
  useEffect(() => {
    const checkRemindersDue = () => {
      const today = new Date();
      const newAlerts = [];

      reminders.forEach((reminder) => {
        if (!reminder.active) return;

        const nextDueDate = getNextDueDate(reminder);
        if (!nextDueDate) return;

        // Calcular días hasta vencimiento
        const daysUntilDue = Math.ceil(
          (nextDueDate - today) / (1000 * 60 * 60 * 24)
        );

        // Alertar si está dentro del período de alerta (7 días por defecto)
        const alertThreshold = reminder.alertDays || 7;

        if (daysUntilDue <= alertThreshold && daysUntilDue >= 0) {
          // Verificar si ya existe una alerta para este recordatorio
          const existingAlert = reminderAlerts.find(
            (alert) =>
              alert.reminderId === reminder.id &&
              isSameDay(new Date(alert.dueDate), nextDueDate)
          );

          if (!existingAlert) {
            newAlerts.push({
              id: `reminder-alert-${Date.now()}-${reminder.id}`,
              reminderId: reminder.id,
              title: reminder.title,
              dueDate: nextDueDate.toISOString(),
              daysRemaining: daysUntilDue,
              message: `¡${reminder.title} vence en ${daysUntilDue} ${
                daysUntilDue === 1 ? "día" : "días"
              }!`,
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        }
      });

      if (newAlerts.length > 0) {
        setReminderAlerts((prev) => [...prev, ...newAlerts]);
      }
    };

    // Ejecutar al montar el componente
    checkRemindersDue();

    // Configurar intervalo para verificar periódicamente
    const intervalId = setInterval(checkRemindersDue, 3600000); // Verificar cada hora

    return () => clearInterval(intervalId);
  }, [reminders, reminderAlerts]);

  /**
   * Determina si dos fechas son el mismo día
   */
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  /**
   * Obtiene la siguiente fecha de vencimiento para un recordatorio
   */
  const getNextDueDate = (reminder) => {
    const today = new Date();

    // Para recordatorios únicos
    if (reminder.type === "one-time") {
      const dueDate = new Date(reminder.dueDate);
      return dueDate;
    }

    // Para recordatorios recurrentes
    if (reminder.type === "recurring") {
      const startDate = new Date(reminder.startDate);
      const frequency = reminder.frequency;

      // Si la fecha de inicio es futura, es la próxima fecha
      if (startDate > today) {
        return startDate;
      }

      // Calcular la próxima fecha basada en la frecuencia
      let nextDate = new Date(startDate);

      while (nextDate <= today) {
        if (frequency === "monthly") {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (frequency === "quarterly") {
          nextDate.setMonth(nextDate.getMonth() + 3);
        } else if (frequency === "yearly") {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        } else if (frequency === "weekly") {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (frequency === "biweekly") {
          nextDate.setDate(nextDate.getDate() + 14);
        }
      }

      return nextDate;
    }

    return null;
  };

  /**
   * Añade un nuevo recordatorio
   */
  const addReminder = async (reminderData) => {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "Usuario no autenticado" };
  
    const newReminder = {
      ...reminderData,
      id: reminderData.id || `reminder-${Date.now()}`,
      createdAt: new Date().toISOString(),
      active: true,
    };
  
    const res = await saveReminder(user.uid, newReminder);
    console.log("Resultado del guardado:", res); // 👈🏼 esto te dirá qué se devuelve

    if (res.success) {
      setReminders((prev) => [...prev, newReminder]);
      return { success: true, id: newReminder.id };
    }
  
    return res;
  };
  
  /**
   * Actualiza un recordatorio existente
   */
  const updateReminder = async (id, updatedData) => {
    const index = reminders.findIndex((r) => r.id === id);
    if (index === -1) return { success: false, error: "Recordatorio no encontrado" };
  
    const updatedReminder = {
      ...reminders[index],
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
  
    const res = await updateReminderInDB(id, updatedReminder);
    if (res.success) {
      const updatedList = [...reminders];
      updatedList[index] = updatedReminder;
      setReminders(updatedList);
      return { success: true };
    }
  
    return res;
  };
  

  /**
   * Elimina un recordatorio
   */
  const deleteReminder = async (id) => {
    const res = await deleteReminderFromDB(id);
    if (res.success) {
      setReminders((prev) => prev.filter((r) => r.id !== id));
      setReminderAlerts((prev) => prev.filter((a) => a.reminderId !== id));
    }
    return res;
  };
  
  /**
   * Activa o desactiva un recordatorio
   */
  const toggleReminderStatus = (id, active) => {
    const index = reminders.findIndex((r) => r.id === id);

    if (index === -1) {
      return { success: false, error: "Recordatorio no encontrado" };
    }

    const updatedReminders = [...reminders];
    updatedReminders[index] = {
      ...updatedReminders[index],
      active,
      updatedAt: new Date().toISOString(),
    };

    setReminders(updatedReminders);
    return { success: true };
  };

  /**
   * Marca una alerta de recordatorio como leída
   */
  const markReminderAlertAsRead = (alertId) => {
    setReminderAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  /**
   * Descarta una alerta de recordatorio
   */
  const dismissReminderAlert = (alertId) => {
    setReminderAlerts((prevAlerts) =>
      prevAlerts.filter((alert) => alert.id !== alertId)
    );
  };

  /**
   * Obtiene recordatorios activos
   */
  const getActiveReminders = () => {
    return reminders.filter((r) => r.active);
  };

  /**
   * Obtiene recordatorios próximos a vencer
   */
  const getUpcomingReminders = (days = 30) => {
    const today = new Date();
    const upcomingDate = new Date(today);
    upcomingDate.setDate(today.getDate() + days);

    return getActiveReminders()
      .filter((reminder) => {
        const nextDueDate = getNextDueDate(reminder);
        return nextDueDate && nextDueDate <= upcomingDate;
      })
      .map((reminder) => ({
        ...reminder,
        nextDueDate: getNextDueDate(reminder),
        daysRemaining: Math.ceil(
          (getNextDueDate(reminder) - today) / (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => a.nextDueDate - b.nextDueDate);
  };

  /**
   * Obtiene el número de alertas no leídas
   */
  const getUnreadReminderCount = () => {
    return reminderAlerts.filter((alert) => !alert.read).length;
  };

  return {
    reminders,
    reminderAlerts,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminderStatus,
    getActiveReminders,
    getUpcomingReminders,
    getNextDueDate,
    markReminderAlertAsRead,
    dismissReminderAlert,
    getUnreadReminderCount,
  };
};

export default useReminders;
