import React, { useState } from "react";

/**
 * Componente para mostrar alertas activas
 */
const AlertDisplay = ({ activeAlerts, markAlertAsRead, dismissAlert }) => {
  const [showAll, setShowAll] = useState(false);

  // Si no hay alertas, no mostrar nada
  if (activeAlerts.length === 0) {
    return null;
  }

  // Mostrar solo algunas alertas si hay muchas y no se ha elegido verlas todas
  const alertsToShow = showAll ? activeAlerts : activeAlerts.slice(0, 3);

  const handleMarkAsRead = (alertId) => {
    markAlertAsRead(alertId);
  };

  const handleDismiss = (alertId) => {
    dismissAlert(alertId);
  };

  // Formato de fecha para las alertas
  const formatAlertTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="mb-6 rounded shadow overflow-hidden">
      <div className="bg-yellow-100 p-3 border-b border-yellow-200">
        <h3 className="font-medium text-yellow-800">
          Alertas ({activeAlerts.length})
        </h3>
      </div>

      <ul className="divide-y divide-gray-100">
        {alertsToShow.map((alert) => (
          <li
            key={alert.id}
            className={`p-3 ${alert.read ? "bg-white" : "bg-blue-50"}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p
                  className={`${
                    alert.read ? "text-gray-700" : "font-medium text-black"
                  }`}
                >
                  {alert.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatAlertTime(alert.timestamp)}
                </p>
              </div>
              <div className="flex space-x-2">
                {!alert.read && (
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Marcar como leída
                  </button>
                )}
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Descartar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {activeAlerts.length > 3 && (
        <div className="bg-gray-50 p-2 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAll ? "Mostrar menos" : `Ver todas (${activeAlerts.length})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertDisplay;
