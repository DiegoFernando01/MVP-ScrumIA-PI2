import { useState, useEffect, useCallback } from "react";

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
    console.log("useAlerts: Loading saved configurations");
    const savedConfigs = localStorage.getItem("alertConfigurations");
    if (savedConfigs) {
      try {
        const parsedConfigs = JSON.parse(savedConfigs);
        console.log("useAlerts: Loaded configs from localStorage:", parsedConfigs);
        setAlertConfigs(parsedConfigs);
      } catch (error) {
        console.error("Error parsing alert configurations:", error);
        setAlertConfigs([]);
      }
    } else {
      // Configuración predeterminada: alerta de presupuesto al 90%
      const defaultConfig = [
        {
          id: "default-budget-alert",
          name: "Alerta de presupuesto",
          type: "budget",
          criteria: {
            thresholdPercentage: 90,
          },
          enabled: true,
        },
      ];
      console.log("useAlerts: Setting default config:", defaultConfig);
      setAlertConfigs(defaultConfig);
    }

    // Cargar alertas activas guardadas
    const savedAlerts = localStorage.getItem("activeAlerts");
    if (savedAlerts) {
      try {
        const parsedAlerts = JSON.parse(savedAlerts);
        console.log("useAlerts: Loaded active alerts from localStorage:", parsedAlerts);
        setActiveAlerts(parsedAlerts);
      } catch (error) {
        console.error("Error parsing active alerts:", error);
        setActiveAlerts([]);
      }
    }
  }, []);

  // Guardar configuraciones cuando cambian
  useEffect(() => {
    console.log("useAlerts: Saving alert configurations to localStorage:", alertConfigs);
    localStorage.setItem("alertConfigurations", JSON.stringify(alertConfigs));
  }, [alertConfigs]);

  // Guardar alertas activas cuando cambian
  useEffect(() => {
    console.log("useAlerts: Saving active alerts to localStorage:", activeAlerts);
    localStorage.setItem("activeAlerts", JSON.stringify(activeAlerts));
  }, [activeAlerts]);

  /**
   * Agrega o actualiza una configuración de alerta
   * @param {Object} alertConfig - Configuración de la alerta
   * @returns {string} ID de la alerta creada o actualizada
   */
  const saveAlertConfig = useCallback((alertConfig) => {
    const newId = alertConfig.id || `alert-${Date.now()}`;
    const newConfig = { ...alertConfig, id: newId };

    // Verificar si la alerta ya existe
    const existingIndex = alertConfigs.findIndex((a) => a.id === newId);

    if (existingIndex >= 0) {
      // Actualizar existente
      console.log(`useAlerts: Updating existing alert config: ${newId}`, newConfig);
      setAlertConfigs(prevConfigs => {
        const updatedConfigs = [...prevConfigs];
        updatedConfigs[existingIndex] = newConfig;
        return updatedConfigs;
      });
    } else {
      // Agregar nueva
      console.log(`useAlerts: Adding new alert config: ${newId}`, newConfig);
      setAlertConfigs(prevConfigs => [...prevConfigs, newConfig]);
    }

    return newId;
  }, [alertConfigs]);

  /**
   * Elimina una configuración de alerta
   * @param {string} alertId - ID de la alerta a eliminar
   * @returns {boolean} Indica si la operación fue exitosa
   */
  const removeAlertConfig = useCallback((alertId) => {
    console.log(`useAlerts: Removing alert config: ${alertId}`);
    let configFound = false;
    
    setAlertConfigs(prevConfigs => {
      const filteredConfigs = prevConfigs.filter((a) => {
        const matches = a.id !== alertId;
        if (!matches) configFound = true;
        return matches;
      });
      return filteredConfigs;
    });

    if (!configFound) {
      console.log(`useAlerts: Alert config not found: ${alertId}`);
      return false;
    }

    // También eliminar cualquier alerta activa relacionada
    setActiveAlerts(prevAlerts => {
      const filteredAlerts = prevAlerts.filter((a) => a.configId !== alertId);
      const removedCount = prevAlerts.length - filteredAlerts.length;
      console.log(`useAlerts: Removed ${removedCount} active alerts associated with config ${alertId}`);
      return filteredAlerts;
    });

    return true;
  }, []);

  /**
   * Activa o desactiva una configuración de alerta
   * @param {string} alertId - ID de la alerta a modificar
   * @param {boolean} enabled - Estado de activación
   * @returns {boolean} Indica si la operación fue exitosa
   */
  const toggleAlertConfig = useCallback((alertId, enabled) => {
    console.log(`useAlerts: Toggling alert config ${alertId} to ${enabled}`);
    let success = false;
    
    setAlertConfigs(prevConfigs => {
      const updatedConfigs = prevConfigs.map(config => {
        if (config.id === alertId) {
          success = true;
          return { ...config, enabled };
        }
        return config;
      });
      return updatedConfigs;
    });

    return success;
  }, []);

  /**
   * Elimina todas las alertas de presupuesto actuales 
   * para que puedan ser recalculadas
   */
  const resetBudgetAlerts = useCallback(() => {
    console.log("useAlerts: Resetting all budget alerts");
    setActiveAlerts(prevAlerts => {
      const filtered = prevAlerts.filter(alert => 
        alert.type !== 'budget' && alert.type !== 'budget-exceeded'
      );
      console.log(`useAlerts: Removed ${prevAlerts.length - filtered.length} budget alerts`);
      return filtered;
    });
  }, []);

  /**
   * Evalúa presupuestos y genera alertas para categorías cerca del límite
   * @param {Array} categories - Lista de categorías con presupuesto
   * @param {Function} budgetCalculator - Función para calcular uso del presupuesto
   */
  const checkBudgetAlerts = useCallback((categories, budgetCalculator) => {
    console.log("useAlerts: Checking budget alerts for categories:", categories);
    // Obtener configuraciones de alertas de presupuesto activas
    const budgetAlerts = alertConfigs.filter(
      (a) => a.type === "budget" && a.enabled
    );

    console.log(`useAlerts: Found ${budgetAlerts.length} active budget alert configurations`);
    
    if (budgetAlerts.length === 0) {
      console.log("useAlerts: No budget alert configurations enabled");
      return;
    }

    // Lista temporal de nuevas alertas
    const newAlerts = [];

    // Evaluar cada categoría
    categories.forEach((category) => {
      const usage = budgetCalculator(category);
      console.log(`useAlerts: Category ${category} usage:`, usage);

      // Si tiene presupuesto y hay alertas configuradas
      if (usage.hasbudget) {
        budgetAlerts.forEach((alertConfig) => {
          const threshold = alertConfig.criteria.thresholdPercentage || 90;

          // Si se alcanza o supera el umbral y no hay alerta activa
          if (usage.percentage >= threshold && usage.percentage < 100) {
            const existingAlert = activeAlerts.find(
              (a) => a.configId === alertConfig.id && a.category === category && a.type === "budget"
            );

            if (!existingAlert) {
              const newAlert = {
                id: `budget-alert-${Date.now()}-${category}`,
                configId: alertConfig.id,
                type: "budget",
                category,
                message: `Has alcanzado el ${usage.percentage.toFixed(
                  0
                )}% de tu presupuesto en la categoría "${category}"`,
                timestamp: new Date().toISOString(),
                read: false,
              };
              console.log("useAlerts: Creating new threshold alert:", newAlert);
              newAlerts.push(newAlert);
            } else {
              console.log(`useAlerts: Threshold alert already exists for ${category}`);
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
              const newAlert = {
                id: `budget-exceeded-${Date.now()}-${category}`,
                configId: alertConfig.id,
                type: "budget-exceeded",
                category,
                message: `¡Has excedido tu presupuesto en la categoría "${category}"!`,
                timestamp: new Date().toISOString(),
                read: false,
              };
              console.log("useAlerts: Creating new exceeded alert:", newAlert);
              newAlerts.push(newAlert);
            } else {
              console.log(`useAlerts: Budget exceeded alert already exists for ${category}`);
            }
          }
        });
      } else {
        console.log(`useAlerts: Category ${category} has no budget set`);
      }
    });

    if (newAlerts.length > 0) {
      console.log(`useAlerts: Adding ${newAlerts.length} new alerts:`, newAlerts);
      setActiveAlerts(prevAlerts => [...prevAlerts, ...newAlerts]);
    } else {
      console.log("useAlerts: No new alerts to add");
    }
  }, [alertConfigs, activeAlerts]);

  /**
   * Marca una alerta como leída
   * @param {string} alertId - ID de la alerta
   */
  const markAlertAsRead = useCallback((alertId) => {
    console.log(`useAlerts: Marking alert as read: ${alertId}`);
    setActiveAlerts(prevAlerts => {
      const updated = prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      );
      const wasUpdated = JSON.stringify(updated) !== JSON.stringify(prevAlerts);
      console.log(`useAlerts: Alert updated: ${wasUpdated}`);
      return updated;
    });
  }, []);

  /**
   * Descarta (elimina) una alerta activa
   * @param {string} alertId - ID de la alerta
   */
  const dismissAlert = useCallback((alertId) => {
    console.log(`useAlerts: Dismissing alert: ${alertId}`);
    setActiveAlerts(prevAlerts => {
      const filtered = prevAlerts.filter((alert) => alert.id !== alertId);
      const wasRemoved = filtered.length < prevAlerts.length;
      console.log(`useAlerts: Alert removed: ${wasRemoved}`);
      return filtered;
    });
  }, []);

  /**
   * Obtiene el conteo de alertas no leídas
   */
  const getUnreadCount = useCallback(() => {
    const count = activeAlerts.filter((a) => !a.read).length;
    console.log(`useAlerts: Unread alerts count: ${count} out of ${activeAlerts.length} total`);
    return count;
  }, [activeAlerts]);

  /**
   * Función para crear una alerta de prueba
   * @returns {string} ID de la alerta creada
   */
  const createTestAlert = useCallback(() => {
    const testAlertId = `test-alert-${Date.now()}`;
    const testAlert = {
      id: testAlertId,
      type: 'test',
      category: 'General',
      message: 'Esta es una alerta de prueba para verificar el sistema de notificaciones.',
      timestamp: new Date().toISOString(),
      read: false,
      configId: 'test-config'
    };
    
    console.log("Creating test alert:", testAlert);
    setActiveAlerts(prevAlerts => [...prevAlerts, testAlert]);
    return testAlertId;
  }, []);

  return {
    alertConfigs,
    activeAlerts,
    saveAlertConfig,
    removeAlertConfig,
    toggleAlertConfig,
    resetBudgetAlerts,
    checkBudgetAlerts,
    markAlertAsRead,
    dismissAlert,
    getUnreadCount,
    createTestAlert,  // Método de prueba para crear una alerta manualmente
  };
};

export default useAlerts;
