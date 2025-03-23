import { useState, useEffect } from "react";

/**
 * Hook personalizado para gestionar alertas de transacciones
 * @returns {Object} Métodos y estados para manejar alertas
 */
const useAlerts = () => {
  // Estado para configuraciones de alertas
  const [alertConfigs, setAlertConfigs] = useState([]);

  // Estado para alertas activas
  const [activeAlerts, setActiveAlerts] = useState([]);

  // Cargar configuraciones guardadas al iniciar
  useEffect(() => {
    const savedConfigs = localStorage.getItem("alertConfigurations");
    if (savedConfigs) {
      setAlertConfigs(JSON.parse(savedConfigs));
    } else {
      // Configuración predeterminada: alerta de presupuesto al 90%
      setAlertConfigs([
        {
          id: "default-budget-alert",
          name: "Alerta de presupuesto",
          type: "budget",
          criteria: {
            thresholdPercentage: 90,
          },
          enabled: true,
        },
      ]);
    }
  }, []);

  // Guardar configuraciones cuando cambian
  useEffect(() => {
    localStorage.setItem("alertConfigurations", JSON.stringify(alertConfigs));
  }, [alertConfigs]);

  /**
   * Agrega o actualiza una configuración de alerta
   * @param {Object} alertConfig - Configuración de la alerta
   * @returns {string} ID de la alerta creada o actualizada
   */
  const saveAlertConfig = (alertConfig) => {
    const newId = alertConfig.id || `alert-${Date.now()}`;
    const newConfig = { ...alertConfig, id: newId };

    // Verificar si la alerta ya existe
    const existingIndex = alertConfigs.findIndex((a) => a.id === newId);

    if (existingIndex >= 0) {
      // Actualizar existente
      const updatedConfigs = [...alertConfigs];
      updatedConfigs[existingIndex] = newConfig;
      setAlertConfigs(updatedConfigs);
    } else {
      // Agregar nueva
      setAlertConfigs([...alertConfigs, newConfig]);
    }

    return newId;
  };

  /**
   * Elimina una configuración de alerta
   * @param {string} alertId - ID de la alerta a eliminar
   * @returns {boolean} Indica si la operación fue exitosa
   */
  const removeAlertConfig = (alertId) => {
    const filteredConfigs = alertConfigs.filter((a) => a.id !== alertId);

    if (filteredConfigs.length === alertConfigs.length) {
      return false; // No se encontró la alerta
    }

    setAlertConfigs(filteredConfigs);

    // También eliminar cualquier alerta activa relacionada
    setActiveAlerts(activeAlerts.filter((a) => a.configId !== alertId));

    return true;
  };

  /**
   * Activa o desactiva una configuración de alerta
   * @param {string} alertId - ID de la alerta a modificar
   * @param {boolean} enabled - Estado de activación
   * @returns {boolean} Indica si la operación fue exitosa
   */
  const toggleAlertConfig = (alertId, enabled) => {
    const index = alertConfigs.findIndex((a) => a.id === alertId);

    if (index < 0) return false;

    const updatedConfigs = [...alertConfigs];
    updatedConfigs[index] = {
      ...updatedConfigs[index],
      enabled,
    };

    setAlertConfigs(updatedConfigs);
    return true;
  };

  /**
   * Evalúa presupuestos y genera alertas para categorías cerca del límite
   * @param {Array} categories - Lista de categorías con presupuesto
   * @param {Function} budgetCalculator - Función para calcular uso del presupuesto
   */
  const checkBudgetAlerts = (categories, budgetCalculator) => {
    // Obtener configuraciones de alertas de presupuesto activas
    const budgetAlerts = alertConfigs.filter(
      (a) => a.type === "budget" && a.enabled
    );

    if (budgetAlerts.length === 0) return;

    // Lista temporal de nuevas alertas
    const newAlerts = [];

    // Evaluar cada categoría
    categories.forEach((category) => {
      const usage = budgetCalculator(category);

      // Si tiene presupuesto y hay alertas configuradas
      if (usage.hasbudget) {
        budgetAlerts.forEach((alertConfig) => {
          const threshold = alertConfig.criteria.thresholdPercentage || 90;

          // Si se alcanza o supera el umbral y no hay alerta activa
          if (usage.percentage >= threshold && usage.percentage < 100) {
            const existingAlert = activeAlerts.find(
              (a) => a.configId === alertConfig.id && a.category === category
            );

            if (!existingAlert) {
              newAlerts.push({
                id: `budget-alert-${Date.now()}-${category}`,
                configId: alertConfig.id,
                type: "budget",
                category,
                message: `Has alcanzado el ${usage.percentage.toFixed(
                  0
                )}% de tu presupuesto en la categoría "${category}"`,
                timestamp: new Date().toISOString(),
                read: false,
              });
            }
          }

          // Alerta especial para presupuesto excedido
          if (usage.isOverBudget) {
            const existingOverAlert = activeAlerts.find(
              (a) =>
                a.configId === alertConfig.id &&
                a.category === category &&
                a.type === "budget-exceeded"
            );

            if (!existingOverAlert) {
              newAlerts.push({
                id: `budget-exceeded-${Date.now()}-${category}`,
                configId: alertConfig.id,
                type: "budget-exceeded",
                category,
                message: `¡Has excedido tu presupuesto en la categoría "${category}"!`,
                timestamp: new Date().toISOString(),
                read: false,
              });
            }
          }
        });
      }
    });

    if (newAlerts.length > 0) {
      setActiveAlerts((prevAlerts) => [...prevAlerts, ...newAlerts]);
    }
  };

  /**
   * Marca una alerta como leída
   * @param {string} alertId - ID de la alerta
   */
  const markAlertAsRead = (alertId) => {
    setActiveAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  /**
   * Descarta (elimina) una alerta activa
   * @param {string} alertId - ID de la alerta
   */
  const dismissAlert = (alertId) => {
    setActiveAlerts((prevAlerts) =>
      prevAlerts.filter((alert) => alert.id !== alertId)
    );
  };

  /**
   * Obtiene el conteo de alertas no leídas
   */
  const getUnreadCount = () => {
    return activeAlerts.filter((a) => !a.read).length;
  };

  return {
    alertConfigs,
    activeAlerts,
    saveAlertConfig,
    removeAlertConfig,
    toggleAlertConfig,
    checkBudgetAlerts,
    markAlertAsRead,
    dismissAlert,
    getUnreadCount,
  };
};

export default useAlerts;
