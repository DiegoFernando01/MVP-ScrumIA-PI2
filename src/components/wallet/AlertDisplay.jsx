import React, { useState, useEffect } from "react";
import { FaBell, FaCheckCircle, FaClock, FaAngleDown, FaAngleUp, FaTimes } from "react-icons/fa";

/**
 * Componente para mostrar alertas activas
 * Ahora con soporte para notificaciones flotantes
 */
const AlertDisplay = ({ activeAlerts, markAlertAsRead, dismissAlert, isFloating = false }) => {
  const [showAll, setShowAll] = useState(false);
  
  console.log("AlertDisplay rendered with:", { 
    alertCount: activeAlerts?.length || 0, 
    isFloating, 
    alerts: activeAlerts 
  });

  // Si no hay alertas, no mostrar nada
  if (!activeAlerts || activeAlerts.length === 0) {
    console.log("No alerts to display");
    return null;
  }

  // Mostrar solo algunas alertas si hay muchas y no se ha elegido verlas todas
  const alertsToShow = showAll ? activeAlerts : activeAlerts.slice(0, 3);

  const handleMarkAsRead = (alertId) => {
    console.log("Marking alert as read:", alertId);
    markAlertAsRead(alertId);
  };

  const handleDismiss = (alertId) => {
    console.log("Dismissing alert from AlertDisplay:", alertId);
    dismissAlert(alertId);
  };

  // Formato de fecha para las alertas
  const formatAlertTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Si es una notificación flotante, usar un estilo diferente
  if (isFloating) {
    console.log("Rendering floating alerts:", activeAlerts);
    return (
      <div className="alert-container">
        {activeAlerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`alert-item ${alert.type === 'budget-exceeded' ? 'error' : 'warning'}`}
          >
            <div className={`alert-icon ${alert.type === 'budget-exceeded' ? 'error' : 'warning'}`}>
              {alert.type === 'budget-exceeded' ? '❗' : '⚠️'}
            </div>
            <div className="alert-content">
              <h4 className="alert-title">{alert.category ? `Alerta: ${alert.category}` : "Alerta"}</h4>
              <p className="alert-message">{alert.message}</p>
            </div>
            <button 
              className="alert-close"
              onClick={() => handleDismiss(alert.id)}
              aria-label="Cerrar"
            >
              <FaTimes />
            </button>
            <div className={`alert-progress ${alert.type === 'budget-exceeded' ? 'error' : 'warning'}`}></div>
          </div>
        ))}
      </div>
    );
  }

  // Vista normal para panel de alertas
  console.log("Rendering regular alerts panel:", alertsToShow);
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
