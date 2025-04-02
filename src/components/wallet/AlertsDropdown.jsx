import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaCheckCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";

/**
 * Componente para mostrar un menú desplegable de alertas en el encabezado
 */
const AlertsDropdown = ({ 
  alerts, 
  reminderAlerts, 
  markAlertAsRead, 
  dismissAlert, 
  markReminderAlertAsRead, 
  dismissReminderAlert 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Log para depuración
  console.log("AlertsDropdown rendered with:", { 
    alertsCount: Array.isArray(alerts) ? alerts.length : 'not an array', 
    reminderAlertsCount: Array.isArray(reminderAlerts) ? reminderAlerts.length : 'not an array',
    alerts,
    reminderAlerts
  });
  
  // Asegurar que alertas y reminderAlerts sean arrays, incluso si son undefined
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const safeReminderAlerts = Array.isArray(reminderAlerts) ? reminderAlerts : [];
  
  // Combinar alertas de presupuesto y recordatorios
  const allAlerts = [
    ...safeAlerts.map(alert => ({
      ...alert,
      type: alert.type || 'budget',
      isReminder: false
    })),
    ...safeReminderAlerts.map(alert => ({
      ...alert,
      isReminder: true
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  const unreadCount = allAlerts.filter(alert => !alert.read).length;
  
  // Limitar a las 5 más recientes para la vista rápida
  const recentAlerts = allAlerts.slice(0, 5);
  
  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Manejar acciones de alertas
  const handleAlertAction = (alert, action) => {
    console.log("Alert action triggered:", { alert, action });
    if (alert.isReminder) {
      if (action === 'read') markReminderAlertAsRead(alert.id);
      else if (action === 'dismiss') dismissReminderAlert(alert.id);
    } else {
      if (action === 'read') markAlertAsRead(alert.id);
      else if (action === 'dismiss') dismissAlert(alert.id);
    }
  };
  
  // Formatear la fecha para mejor legibilidad
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  console.log("AlertsDropdown - allAlerts:", allAlerts);
  console.log("AlertsDropdown - unreadCount:", unreadCount);
  
  return (
    <div className="alerts-dropdown-container" ref={dropdownRef}>
      <button 
        className={`notification-button ${allAlerts.length > 0 ? 'has-alerts' : 'no-alerts'}`}
        onClick={() => setIsOpen(!isOpen)}
        title={unreadCount > 0 ? `${unreadCount} alertas sin leer` : "No hay alertas sin leer"}
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="alerts-dropdown-menu">
          <div className="alerts-dropdown-header">
            <h3>
              <FaBell /> Alertas Recientes
              {unreadCount > 0 && (
                <span className="alerts-dropdown-badge">{unreadCount}</span>
              )}
            </h3>
          </div>
          
          <div className="alerts-dropdown-content">
            {recentAlerts.length > 0 ? (
              <ul className="alerts-dropdown-list">
                {recentAlerts.map((alert) => (
                  <li 
                    key={alert.id} 
                    className={`alert-dropdown-item ${!alert.read ? 'unread' : ''}`}
                  >
                    <div className="alert-dropdown-icon">
                      {alert.isReminder ? '📅' : 
                        alert.type === 'budget-exceeded' ? <FaExclamationTriangle className="icon-exceeded" /> : 
                        <FaExclamationTriangle className="icon-warning" />
                      }
                    </div>
                    <div className="alert-dropdown-content">
                      <p className="alert-dropdown-message">
                        {alert.message}
                      </p>
                      <div className="alert-dropdown-time">
                        <FaClock /> {formatTime(alert.timestamp)}
                      </div>
                    </div>
                    <div className="alert-dropdown-actions">
                      {!alert.read && (
                        <button 
                          onClick={() => handleAlertAction(alert, 'read')}
                          className="alert-dropdown-btn read"
                          title="Marcar como leída"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      <button 
                        onClick={() => handleAlertAction(alert, 'dismiss')}
                        className="alert-dropdown-btn dismiss"
                        title="Descartar"
                      >
                        &times;
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="alerts-dropdown-empty">
                <p>No hay alertas pendientes</p>
              </div>
            )}
          </div>
          
          <div className="alerts-dropdown-footer">
            <button 
              className="alerts-dropdown-view-all"
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new CustomEvent('navigate-to-alerts'));
              }}
            >
              Ver todas las alertas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsDropdown;