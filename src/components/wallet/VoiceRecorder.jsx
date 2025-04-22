import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaTrash, FaPause, FaPlay, FaPaperPlane, FaCheck } from "react-icons/fa";
import { executeIntentAction } from "../../utils/speechIntentMapper";
import "../../styles/components/wallet/VoiceRecorder.css";

/**
 * Componente para la grabación y visualización de audio
 * Ahora con mapeo de intents a acciones de la interfaz
 */
const VoiceRecorder = ({ onIntentDetected }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState("");
  const [visualizerData, setVisualizerData] = useState(Array(20).fill(5));
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState("");
  const [languageProcessingResult, setLanguageProcessingResult] = useState(null);
  const [intentActionResult, setIntentActionResult] = useState(null);
  const [intentExecuted, setIntentExecuted] = useState(false);
  
  const dropdownRef = useRef(null);
  const timerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const visualizerTimerRef = useRef(null);
  const autoCloseTimerRef = useRef(null);
  
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
  
  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (visualizerTimerRef.current) clearInterval(visualizerTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

  // Auto-cierre después de ejecutar una acción exitosa
  useEffect(() => {
    if (intentExecuted && intentActionResult && intentActionResult.success) {
      // Esperar 3 segundos para mostrar el resultado antes de cerrar
      autoCloseTimerRef.current = setTimeout(() => {
        resetRecorderState();
        setIsOpen(false);
      }, 3000);
    }
    
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, [intentExecuted, intentActionResult]);
  
  // Gestionar tiempo de grabación
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Efecto para manejar la animación del visualizador
  useEffect(() => {
    // Iniciar o detener la animación según el estado de grabación
    if (isRecording && !isPaused) {
      // Usar un intervalo para actualizar el visualizador cada 100ms
      visualizerTimerRef.current = setInterval(updateVisualizer, 100);
    } else {
      // Limpiar el intervalo cuando se pausa o detiene la grabación
      if (visualizerTimerRef.current) {
        clearInterval(visualizerTimerRef.current);
      }
    }

    return () => {
      if (visualizerTimerRef.current) {
        clearInterval(visualizerTimerRef.current);
      }
    };
  }, [isRecording, isPaused]);
  
  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };
  
  // Actualizar datos del visualizador
  const updateVisualizer = () => {
    // Generar nuevas alturas aleatorias para las barras
    const newData = Array(20).fill(0).map(() => 
      Math.max(5, Math.min(60, Math.random() * 55 + 5))
    );
    setVisualizerData(newData);
  };

  // Función para resetear completamente el estado del grabador
  const resetRecorderState = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    
    setAudioURL("");
    setRecordingTime(0);
    setTranscriptionResult("");
    setLanguageProcessingResult(null);
    setIntentActionResult(null);
    setIntentExecuted(false);
    setIsRecording(false);
    setIsPaused(false);
    
    // Asegurarse de que todos los temporizadores estén detenidos
    if (timerRef.current) clearInterval(timerRef.current);
    if (visualizerTimerRef.current) clearInterval(visualizerTimerRef.current);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    
    // Detener el MediaRecorder si todavía está activo
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };
  
  // Iniciar grabación
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Usamos audio/webm con codificación de audio compatible con el navegador
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : MediaRecorder.isTypeSupported('audio/webm')
              ? 'audio/webm'
              : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 16000 // Tasa de bits adecuada para transcripción
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setIntentActionResult(null);
      setIntentExecuted(false);
      
    } catch (error) {
      alert("No se pudo acceder al micrófono. Por favor, asegúrate de dar permiso para usar el micrófono.");
    }
  };
  
  // Pausar grabación
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (!isPaused) {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      } else {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      }
    }
  };
  
  // Detener grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Detener todos los tracks del stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
      setIsPaused(false);
    }
  };
  
  // Descartar grabación
  const discardRecording = () => {
    resetRecorderState();
  };
  
  // Procesar audio con Azure
  const processAudio = async () => {
    if (!audioURL) return;
    
    try {
      setIsProcessing(true);
      setLanguageProcessingResult(null);
      setIntentActionResult(null);
      setIntentExecuted(false);
      
      // Obtener el blob de audio desde la URL
      const response = await fetch(audioURL);
      const audioBlob = await response.blob();
      
      // Mostrar mensaje mientras se procesa
      setTranscriptionResult("Procesando audio...");
      
      // Crear FormData
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('audioType', audioBlob.type); // Incluir el tipo MIME para ayudar al servidor
      
      // Usar XMLHttpRequest para mejor manejo de FormData
      const transcriptionResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/transcribe', true);
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`Error HTTP ${xhr.status}`));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error("Error de red"));
        };
        
        // Enviar la solicitud
        xhr.send(formData);
      });
      
      // Actualizar el resultado de la transcripción
      const transcribedText = transcriptionResponse.text || "No se detectó texto en el audio";
      setTranscriptionResult(transcribedText);
      
      // Si se obtuvo texto transcrito, enviarlo al API de procesamiento de lenguaje
      if (transcribedText && transcribedText !== "No se detectó texto en el audio") {
        try {
          const languageResponse = await fetch('/api/processLanguage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: transcribedText }),
          });
          
          if (!languageResponse.ok) {
            throw new Error(`Error en procesamiento de lenguaje: ${languageResponse.status}`);
          }
          
          const languageResult = await languageResponse.json();
          setLanguageProcessingResult(languageResult);
          
          // Notificar al componente padre sobre el intent detectado
          if (onIntentDetected && languageResult.intent) {
            onIntentDetected(languageResult);
          }
        } catch (error) {
          console.error("Error al procesar el lenguaje:", error);
        }
      }
      
      setIsProcessing(false);
    } catch (error) {
      setTranscriptionResult("Error al procesar el audio: " + error.message);
      setIsProcessing(false);
    }
  };
  
  // Ejecutar la acción basada en el intent y entities detectados
  const executeAction = () => {
    if (!languageProcessingResult || !languageProcessingResult.intent || intentExecuted) {
      return;
    }
    
    // Definir callbacks para las acciones
    const callbacks = {
      onCreateTransaction: (transaction) => {
        // Disparar evento personalizado con los datos de la transacción
        const event = new CustomEvent('voice-create-transaction', { 
          detail: { transaction } 
        });
        window.dispatchEvent(event);
      },
      
      onFilterTransactions: (filters) => {
        // Disparar evento para aplicar filtros
        const event = new CustomEvent('voice-filter-transactions', { 
          detail: { filters } 
        });
        window.dispatchEvent(event);
        
        // Si hay un filtro de tipo, mostrar la pestaña correspondiente
        if (filters.type === 'expense' || filters.type === 'income') {
          window.dispatchEvent(new Event('navigate-to-transactions'));
        }
      },
      
      onCheckBalance: () => {
        // Obtener y devolver el balance actual
        const balanceElement = document.querySelector('.card-title:contains("Balance") + .card-content .card-value');
        if (balanceElement) {
          const balanceText = balanceElement.textContent.trim().replace('$', '').replace(',', '');
          return parseFloat(balanceText);
        }
        return 0;
      },
      
      onCheckExpenses: (categoria, periodo) => {
        // Navegar a la pestaña de transacciones
        window.dispatchEvent(new Event('navigate-to-transactions'));
        
        // Aplicar filtros si es necesario
        if (categoria) {
          const event = new CustomEvent('voice-filter-transactions', { 
            detail: { filters: { type: 'expense', category: categoria } } 
          });
          window.dispatchEvent(event);
        }
        
        // Devolver el total de gastos
        const expensesElement = document.querySelector('.card-title:contains("Gastos") + .card-content .card-value');
        if (expensesElement) {
          const expensesText = expensesElement.textContent.trim().replace('$', '').replace(',', '');
          return { total: parseFloat(expensesText) };
        }
        return { total: 0 };
      },
      
      onCheckIncomes: (categoria, periodo) => {
        // Navegar a la pestaña de transacciones
        window.dispatchEvent(new Event('navigate-to-transactions'));
        
        // Aplicar filtros si es necesario
        if (categoria) {
          const event = new CustomEvent('voice-filter-transactions', { 
            detail: { filters: { type: 'income', category: categoria } } 
          });
          window.dispatchEvent(event);
        }
        
        // Devolver el total de ingresos
        const incomesElement = document.querySelector('.card-title:contains("Ingresos") + .card-content .card-value');
        if (incomesElement) {
          const incomesText = incomesElement.textContent.trim().replace('$', '').replace(',', '');
          return { total: parseFloat(incomesText) };
        }
        return { total: 0 };
      }
    };
    
    // Ejecutar la acción correspondiente al intent
    const result = executeIntentAction(
      languageProcessingResult.intent,
      languageProcessingResult.entities || [],
      callbacks
    );
    
    setIntentActionResult(result);
    setIntentExecuted(true);
  };
  
  return (
    <div className="voice-recorder-container" ref={dropdownRef}>
      <button 
        className={`voice-button ${isRecording ? 'is-recording' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={isRecording ? "Grabando audio" : "Grabar audio"}
      >
        <span>🎤</span>
        {isRecording && (
          <span className="recording-indicator"></span>
        )}
      </button>
      
      {isOpen && (
        <div className="voice-recorder-dropdown">
          <div className="voice-recorder-header">
            <h3>
              <FaMicrophone /> Grabación de voz
            </h3>
          </div>
          
          <div className="voice-recorder-content">
            {isRecording ? (
              <>
                <div className="voice-visualizer">
                  {visualizerData.map((height, idx) => (
                    <div 
                      key={idx} 
                      className="visualizer-bar" 
                      style={{ height: `${height}%`, transition: 'height 0.1s ease' }}
                    ></div>
                  ))}
                </div>
                
                <div className="recording-time">
                  <div className={`recording-indicator ${isPaused ? 'paused' : ''}`}></div>
                  <span>{formatTime(recordingTime)}</span>
                </div>
                
                <div className="voice-recorder-actions">
                  {isPaused ? (
                    <button 
                      onClick={pauseRecording}
                      className="recorder-btn resume"
                      title="Continuar grabación"
                    >
                      <FaPlay /> Continuar
                    </button>
                  ) : (
                    <button 
                      onClick={pauseRecording}
                      className="recorder-btn pause"
                      title="Pausar grabación"
                    >
                      <FaPause /> Pausar
                    </button>
                  )}
                  
                  <button 
                    onClick={stopRecording}
                    className="recorder-btn stop"
                    title="Detener grabación"
                  >
                    <FaStop /> Detener
                  </button>
                </div>
              </>
            ) : audioURL ? (
              <div className="recording-playback">
                <audio controls className="audio-player" src={audioURL}></audio>
                
                {transcriptionResult && (
                  <div className="transcription-result">
                    <p><strong>Transcripción:</strong> {transcriptionResult}</p>
                  </div>
                )}
                
                {languageProcessingResult && (
                  <div className="language-processing-result">
                    <p><strong>Intención:</strong> {languageProcessingResult.intent}</p>
                    {languageProcessingResult.entities && languageProcessingResult.entities.length > 0 && (
                      <div className="entities-list">
                        <p><strong>Entidades:</strong></p>
                        <ul>
                          {languageProcessingResult.entities.map((entity, index) => (
                            <li key={index}>
                              {entity.category}: <strong>{entity.text}</strong>
                              {entity.resolutions && entity.resolutions.length > 0 && (
                                <span> ({entity.resolutions[0].value})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {!intentExecuted && (
                      <button 
                        onClick={executeAction}
                        className="recorder-btn execute-action"
                        title="Ejecutar acción"
                      >
                        <FaCheck /> Ejecutar acción
                      </button>
                    )}
                  </div>
                )}
                
                <div className="voice-recorder-actions">
                  <button 
                    onClick={processAudio}
                    className="recorder-btn process"
                    title="Procesar audio"
                    disabled={isProcessing}
                  >
                    <FaPaperPlane /> {isProcessing ? 'Procesando...' : 'Procesar'}
                  </button>
                  
                  <button 
                    onClick={discardRecording}
                    className="recorder-btn discard"
                    title="Descartar grabación"
                  >
                    <FaTrash /> Descartar
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-recorder">
                <div className="mic-icon">
                  <FaMicrophone />
                </div>
                <p>Haz clic en Grabar para iniciar una grabación de audio</p>
                
                <button 
                  onClick={startRecording}
                  className="recorder-btn start"
                >
                  <FaMicrophone /> Grabar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;