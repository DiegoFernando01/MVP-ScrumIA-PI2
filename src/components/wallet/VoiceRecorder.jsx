import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaTrash, FaPause, FaPlay, FaPaperPlane } from "react-icons/fa";

/**
 * Componente para la grabación y visualización de audio
 */
const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState("");
  const [visualizerData, setVisualizerData] = useState(Array(20).fill(5));
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState("");
  
  const dropdownRef = useRef(null);
  const timerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const visualizerTimerRef = useRef(null);
  
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
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);
  
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
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL("");
    }
    
    setRecordingTime(0);
    setTranscriptionResult("");
  };
  
  // Procesar audio con Azure
  const processAudio = async () => {
    if (!audioURL) return;
    
    try {
      setIsProcessing(true);
      
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
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/transcribe', true);
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              setTranscriptionResult(result.text || "No se detectó texto en el audio");
              setIsProcessing(false);
              resolve();
            } catch (e) {
              setTranscriptionResult("Error al procesar el audio: " + e.message);
              setIsProcessing(false);
              reject(e);
            }
          } else {
            setTranscriptionResult(`Error al procesar el audio: ${xhr.status}. Intenta una grabación más corta y clara.`);
            setIsProcessing(false);
            reject(new Error(`Error HTTP ${xhr.status}`));
          }
        };
        
        xhr.onerror = function() {
          setTranscriptionResult("Error de red al enviar el audio. Verifica tu conexión.");
          setIsProcessing(false);
          reject(new Error("Error de red"));
        };
        
        // Enviar la solicitud
        xhr.send(formData);
      });
      
    } catch (error) {
      setTranscriptionResult("Error al procesar el audio: " + error.message);
      setIsProcessing(false);
    }
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