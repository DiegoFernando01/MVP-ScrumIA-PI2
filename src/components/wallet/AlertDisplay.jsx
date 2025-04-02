import React, { useState } from "react";
import { FaBell, FaCheckCircle, FaClock, FaAngleDown, FaAngleUp } from "react-icons/fa";

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
    <div className="alerts-display">
      <div className="alerts-header">
        <h3 className="alerts-title">
          <FaBell /> Alertas <span className="alerts-badge">{activeAlerts.length}</span>
        </h3>
      </div>

      <ul className="alerts-list">
        {alertsToShow.map((alert) => (
          <li
            key={alert.id}
            className={`alert-item-display ${!alert.read ? "unread" : ""}`}
          >
            <div className="alert-content-display">
              <p className="alert-message-display">
                {alert.message}
              </p>
              <div className="alert-time">
                <FaClock /> {formatAlertTime(alert.timestamp)}
              </div>
            </div>
            
            <div className="alert-actions">
              {!alert.read && (
                <button
                  onClick={() => handleMarkAsRead(alert.id)}
                  className="btn-action btn-mark-read"
                >
                  <FaCheckCircle /> Marcar como leída
                </button>
              )}
              <button
                onClick={() => handleDismiss(alert.id)}
                className="btn-action btn-dismiss"
              >
                Descartar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {activeAlerts.length > 3 && (
        <div className="alerts-footer">
          <button
            onClick={() => setShowAll(!showAll)}
            className="alerts-show-more"
          >
            {showAll ? (
              <>
                <FaAngleUp /> Mostrar menos
              </>
            ) : (
              <>
                <FaAngleDown /> Ver todas ({activeAlerts.length})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertDisplay;
