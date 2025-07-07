import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { FaUpload, FaTrash, FaPaperPlane, FaCheck } from "react-icons/fa";
import "../../styles/components/wallet/ImageUploader.css";

const ImageUploader = forwardRef(({ onImageProcessed }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [actionExecuted, setActionExecuted] = useState(false);

  const dropdownRef = useRef(null);
  const autoCloseTimerRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    closeAndReset: () => {
      resetUploaderState();
      setIsOpen(false);
    },
    open: () => {
      setIsOpen(true);
    },
  }));

  // Close dropdown on outside click
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

  // Auto-close after successful action
  useEffect(() => {
    if (actionExecuted && analysisResult) {
      autoCloseTimerRef.current = setTimeout(() => {
        resetUploaderState();
        setIsOpen(false);
      }, 3000);
    }

    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, [actionExecuted, analysisResult]);

  // Reset uploader state
  const resetUploaderState = () => {
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }

    setImageFile(null);
    setPreviewURL("");
    setAnalysisResult(null);
    setActionExecuted(false);
    setIsProcessing(false);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  // Process image with API
  const processImage = async () => {
    if (!imageFile) return;

    try {
      setIsProcessing(true);
      setAnalysisResult(null);
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

      if (onImageProcessed) {
        onImageProcessed(result);
      }

      setIsProcessing(false);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      setIsProcessing(false);
    }
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
            <h3>
              <FaUpload /> Subir Imagen
            </h3>
          </div>

          <div className="image-uploader-content">
            {imageFile ? (
              <div className="image-preview">
                <img src={previewURL} alt="Preview" className="preview-image" />

                {analysisResult && (
                  <div className="analysis-result">
                    <p><strong>Resultado del análisis:</strong></p>
                    <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
                  </div>
                )}

                <div className="image-uploader-actions">
                  <button
                    onClick={processImage}
                    className="uploader-btn process"
                    title="Procesar imagen"
                    disabled={isProcessing}
                  >
                    <FaPaperPlane /> {isProcessing ? "Procesando..." : "Procesar"}
                  </button>

                  <button
                    onClick={resetUploaderState}
                    className="uploader-btn discard"
                    title="Descartar imagen"
                  >
                    <FaTrash /> Descartar
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-uploader">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <p>Selecciona una imagen para analizar</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default ImageUploader;