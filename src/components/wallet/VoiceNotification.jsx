import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "../../styles/components/wallet/VoiceNotification.css";

/**
 * Componente para mostrar notificaciones estilizadas de comandos de voz
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.message - Mensaje a mostrar (con tipo y texto)
 * @param {Function} props.onDismiss - Función para cerrar la notificación
 * @param {Number} props.autoHideDuration - Duración en ms antes de ocultar automáticamente
 */
const VoiceNotification = ({ message, onDismiss, autoHideDuration = 8000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);
  
  useEffect(() => {
    // Si hay un mensaje, mostrar la notificación con efecto de flash
    if (message) {
      setIsVisible(true);
      
      // Efecto de flash para llamar la atención
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 1000);
      
      // Configurar temporizador para auto-cerrar la notificación
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (onDismiss) onDismiss();
        }, 300); // Esperar a que termine la animación de salida
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [message, autoHideDuration, onDismiss]);
  
  if (!message || !isVisible) return null;
  
  // Determinar el icono y título según el tipo de mensaje
  const getMessageDetails = () => {
    switch (message.type) {
      case 'success':
        return {
          icon: <FaCheckCircle className="notification-icon success" />,
          title: 'Acción completada exitosamente'
        };
      case 'error':
        return {
          icon: <FaExclamationCircle className="notification-icon error" />,
          title: '¡Error!'
        };
      case 'info':
        return {
          icon: <FaInfoCircle className="notification-icon info" />,
          title: 'Información'
        };
      default:
        return {
          icon: <FaInfoCircle className="notification-icon" />,
          title: 'Mensaje'
        };
    }
  };
  
  const { icon, title } = getMessageDetails();
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };
  
  // Formatear el mensaje para montos numéricos
  const formatMessage = (text) => {
    // Buscar patrones como "$800000" y reemplazarlos con formato de moneda "$800,000"
    return text.replace(/\$\s*(\d+)(\.\d+)?/g, (match, integerPart, decimalPart) => {
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `$${formattedInteger}${decimalPart || ''}`;
    });
  };
  
  return (
    <div className={`voice-notification ${message.type} ${isVisible ? 'show' : 'hide'} ${isFlashing ? 'flash' : ''}`}>
      <div className="notification-content">
        {icon}
        <div className="notification-message">
          <p className="message-title">{title}</p>
          <p className="message-body">{formatMessage(message.message)}</p>
        </div>
        <button className="notification-close" onClick={handleClose} aria-label="Cerrar notificación">
          <FaTimes />
        </button>
      </div>
      <div className="notification-progress">
        <div className="progress-bar" style={{ animationDuration: `${autoHideDuration}ms` }}></div>
      </div>
    </div>
  );
};

export default VoiceNotification;