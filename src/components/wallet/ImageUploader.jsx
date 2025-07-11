import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { FaUpload, FaTrash, FaPaperPlane, FaCheck } from "react-icons/fa";
import { executeIntentAction } from "../../utils/speechIntentMapper";
import "../../styles/components/wallet/ImageUploader.css";

const ImageUploader = forwardRef(({ onImageProcessed }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [imageActionResult, setImageActionResult] = useState(null);
  const [actionExecuted, setActionExecuted] = useState(false);

  const dropdownRef = useRef(null);
  const autoCloseTimerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    closeAndReset: () => {
      resetUploaderState();
      setIsOpen(false);
    },
    open: () => {
      setIsOpen(true);
    },
  }));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

  useEffect(() => {
    if (actionExecuted && imageActionResult && imageActionResult.success) {
      autoCloseTimerRef.current = setTimeout(() => {
        resetUploaderState();
        setIsOpen(false);
      }, 3000);
    }
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, [actionExecuted, imageActionResult]);

  const resetUploaderState = () => {
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }
    setImageFile(null);
    setPreviewURL("");
    setAnalysisResult(null);
    setImageActionResult(null);
    setActionExecuted(false);
    setIsProcessing(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      resetUploaderState();
      setImageFile(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const processImage = async () => {
    if (!imageFile) return;

    try {
      setIsProcessing(true);
      setAnalysisResult(null);
      setImageActionResult(null);
      setActionExecuted(false);

      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch("/api/analyzeImage", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error al procesar la imagen: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);

      if (onImageProcessed && result.intent) {
        onImageProcessed(result);
      }
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      setAnalysisResult({ error: "Error al procesar la imagen." });
    } finally {
      setIsProcessing(false);
    }
  };

  const executeImageAction = () => {
    if (!analysisResult || !analysisResult.intent || actionExecuted) {
      return;
    }

    const callbacks = {
      onNavigateToTab: (tabId) => {
        if (['transactions', 'budgets', 'categories', 'reminders', 'alerts', 'reports'].includes(tabId)) {
          window.dispatchEvent(new Event('navigate-to-' + tabId));
        }
      },
      onCreateTransaction: (transaction) => {
        const event = new CustomEvent('voice-create-transaction', { detail: { transaction } });
        window.dispatchEvent(event);
      },
      onFilterTransactions: (filters) => {
        const event = new CustomEvent('voice-filter-transactions', { detail: { filters } });
        window.dispatchEvent(event);
        if (filters.type === 'expense' || filters.type === 'income') {
          window.dispatchEvent(new Event('navigate-to-transactions'));
        }
      },
      onCheckBalance: () => {
        const balanceElement = document.querySelector('.card-title:contains("Balance") + .card-content .card-value');
        return balanceElement ? { total: parseFloat(balanceElement.textContent.trim().replace('$', '').replace(',', '')) } : { total: 0 };
      },
      onCheckExpenses: (categoria) => {
        window.dispatchEvent(new Event('navigate-to-transactions'));
        if (categoria) {
          window.dispatchEvent(new CustomEvent('voice-filter-transactions', { detail: { filters: { type: 'expense', category: categoria } } }));
        }
        const expensesElement = document.querySelector('.card-title:contains("Gastos") + .card-content .card-value');
        return expensesElement ? { total: parseFloat(expensesElement.textContent.trim().replace('$', '').replace(',', '')) } : { total: 0 };
      },
      onCheckIncomes: (categoria) => {
        window.dispatchEvent(new Event('navigate-to-transactions'));
        if (categoria) {
          window.dispatchEvent(new CustomEvent('voice-filter-transactions', { detail: { filters: { type: 'income', category: categoria } } }));
        }
        const incomesElement = document.querySelector('.card-title:contains("Ingresos") + .card-content .card-value');
        return incomesElement ? { total: parseFloat(incomesElement.textContent.trim().replace('$', '').replace(',', '')) } : { total: 0 };
      }
    };

    const result = executeIntentAction(
      analysisResult.intent,
      analysisResult.entities || [],
      callbacks
    );

    setImageActionResult(result);
    setActionExecuted(true);
  };

  const renderContent = () => {
    if (!imageFile) {
      return (
        <div className="empty-uploader">
          <input
            type="file"
            id="image-upload-input"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
            style={{ display: 'none' }}
          />
          <label htmlFor="image-upload-input" className="file-input-label">
            <FaUpload /> Selecciona una imagen para analizar
          </label>
        </div>
      );
    }

    return (
      <div className="image-preview-container">
        <div className="image-preview">
          <img src={previewURL} alt="Preview" className="preview-image" />
        </div>

        {analysisResult && (
          <div className="analysis-result">
            {analysisResult.error && <p className="error-message">{analysisResult.error}</p>}
            {analysisResult.intent && (
              <>
                <p><strong>Intención:</strong> {analysisResult.intent}</p>
                {analysisResult.entities && analysisResult.entities.length > 0 && (
                  <div className="entities-list">
                    <p><strong>Entidades:</strong></p>
                    <ul>
                      {analysisResult.entities.map((entity, index) => (
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
              </>
            )}
          </div>
        )}

        {imageActionResult && (
          <div className={`action-result ${imageActionResult.success ? 'success' : 'error'}`}>
            <p>{imageActionResult.message}</p>
          </div>
        )}

        <div className="image-uploader-actions">
          {!analysisResult ? (
            <button
              onClick={processImage}
              className="uploader-btn process"
              title="Procesar imagen"
              disabled={isProcessing}
            >
              <FaPaperPlane /> {isProcessing ? "Procesando..." : "Procesar"}
            </button>
          ) : (
            !actionExecuted && analysisResult.intent && analysisResult.intent !== "None" && (
              <button
                onClick={executeImageAction}
                className="uploader-btn execute"
                title="Ejecutar acción"
              >
                <FaCheck /> Ejecutar Acción
              </button>
            )
          )}
          <button
            onClick={resetUploaderState}
            className="uploader-btn discard"
            title="Descartar imagen"
          >
            <FaTrash /> Descartar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="image-uploader-container" ref={dropdownRef}>
      <button
        className="image-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Subir imagen"
      >
        <span>🖼️</span>
      </button>

      {isOpen && (
        <div className="image-uploader-dropdown">
          <div className="image-uploader-header">
            <h3><FaUpload /> Subir Imagen</h3>
          </div>
          <div className="image-uploader-content">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
});

export default ImageUploader;
