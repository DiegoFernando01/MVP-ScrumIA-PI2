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
    const savedConfigs = localStorage.getItem("alertConfigurations");
    if (savedConfigs) {
      try {
        const parsedConfigs = JSON.parse(savedConfigs);
        setAlertConfigs(parsedConfigs);
      } catch (error) {
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
      setAlertConfigs(defaultConfig);
    }

    // Cargar alertas activas guardadas
    const savedAlerts = localStorage.getItem("activeAlerts");
    if (savedAlerts) {
      try {
        const parsedAlerts = JSON.parse(savedAlerts);
        setActiveAlerts(parsedAlerts);
      } catch (error) {
        setActiveAlerts([]);
      }
    }
  }, []);

  // Guardar configuraciones cuando cambian
  useEffect(() => {
    localStorage.setItem("alertConfigurations", JSON.stringify(alertConfigs));
  }, [alertConfigs]);

  // Guardar alertas activas cuando cambian
  useEffect(() => {
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
      setAlertConfigs(prevConfigs => {
        const updatedConfigs = [...prevConfigs];
        updatedConfigs[existingIndex] = newConfig;
        return updatedConfigs;
      });
    } else {
      // Agregar nueva
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
      return false;
    }

    // También eliminar cualquier alerta activa relacionada
    setActiveAlerts(prevAlerts => {
      const filteredAlerts = prevAlerts.filter((a) => a.configId !== alertId);
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
    setActiveAlerts(prevAlerts => {
      const filtered = prevAlerts.filter(alert => 
        alert.type !== 'budget' && alert.type !== 'budget-exceeded'
      );
      return filtered;
    });
  }, []);

  /**
   * Evalúa presupuestos y genera alertas para categorías cerca del límite
   * @param {Array} categories - Lista de categorías con presupuesto
   * @param {Function} budgetCalculator - Función para calcular uso del presupuesto
   */
  const checkBudgetAlerts = useCallback((categories, budgetCalculator) => {
    // Obtener configuraciones de alertas de presupuesto activas
    const budgetAlerts = alertConfigs.filter(
      (a) => a.type === "budget" && a.enabled
    );
    
    if (budgetAlerts.length === 0) {
      return;
    }

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
              newAlerts.push(newAlert);
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
              newAlerts.push(newAlert);
            }
          }
        });
      }
    });

    if (newAlerts.length > 0) {
      setActiveAlerts(prevAlerts => [...prevAlerts, ...newAlerts]);
    }
  }, [alertConfigs, activeAlerts]);

  /**
   * Marca una alerta como leída
   * @param {string} alertId - ID de la alerta
   */
  const markAlertAsRead = useCallback((alertId) => {
    setActiveAlerts(prevAlerts => {
      const updated = prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      );
      return updated;
    });
  }, []);

  /**
   * Descarta (elimina) una alerta activa
   * @param {string} alertId - ID de la alerta
   */
  const dismissAlert = useCallback((alertId) => {
    setActiveAlerts(prevAlerts => {
      const filtered = prevAlerts.filter((alert) => alert.id !== alertId);
      return filtered;
    });
  }, []);

  /**
   * Obtiene el conteo de alertas no leídas
   */
  const getUnreadCount = useCallback(() => {
    return activeAlerts.filter((a) => !a.read).length;
  }, [activeAlerts]);

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
  };
};

export default useAlerts;
