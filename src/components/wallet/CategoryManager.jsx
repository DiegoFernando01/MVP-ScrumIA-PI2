import React, { useState, useEffect } from "react";

/**
 * Componente para administrar categorías
 */
const CategoryManager = ({
  categories,
  removeCategory,
  currentType,
  addCategory,
}) => {
  const [activeTab, setActiveTab] = useState(currentType || "income");
  const [newCatInput, setNewCatInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [animation, setAnimation] = useState("");

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    const timer = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, success]);

  const handleAddCategory = async () => {
    if (!newCatInput.trim()) {
      setError("Por favor ingresa un nombre para la categoría");
      return;
    }

    setLoading(true);
    const result = await addCategory(activeTab, newCatInput.trim());
    setLoading(false);

    if (!result) {
      setError("La categoría ya existe o es inválida");
      return;
    }

    setSuccess(`Categoría "${newCatInput}" agregada correctamente`);
    setNewCatInput("");
    setAnimation("animate-pulse");
    setTimeout(() => setAnimation(""), 500);
  };

  const handleRemoveCategory = async (type, categoryName) => {
    if (
      (type === "income" && categoryName === "Otros ingresos") ||
      (type === "expense" && categoryName === "Otros gastos")
    ) {
      setError("No se pueden eliminar las categorías predeterminadas");
      return;
    }

    const confirmed = confirm(`¿Estás seguro de eliminar la categoría "${categoryName}"?`);
    if (!confirmed) return;

    setLoading(true);
    const result = await removeCategory(type, categoryName);
    setLoading(false);

    if (!result) {
      setError("No se pudo eliminar la categoría");
      return;
    }

    setSuccess(`Categoría "${categoryName}" eliminada correctamente`);
  };

  // Obtener el ícono apropiado para la categoría
  const getCategoryIcon = (category) => {
    const incomeIcons = {
      "Salario": "💵",
      "Ventas": "🏷️",
      "Inversiones": "📈",
      "Préstamo": "🏦",
      "Regalo": "🎁",
      "Otros ingresos": "💰"
    };

    const expenseIcons = {
      "Alimentación": "🍔",
      "Transporte": "🚗",
      "Vivienda": "🏠",
      "Entretenimiento": "🎮",
      "Salud": "💊",
      "Educación": "📚",
      "Ropa": "👕",
      "Servicios": "📱",
      "Otros gastos": "🛒"
    };

    if (activeTab === "income") {
      return incomeIcons[category] || "💵";
    } else {
      return expenseIcons[category] || "💸";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddCategory();
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="card-icon">🏷️</span> Administrar Categorías
        </h2>
        <p className="text-gray-500 text-sm">Personaliza tus categorías para un mejor control de tus finanzas</p>
      </div>

      {/* Pestañas para cambiar entre ingresos y gastos */}
      <div className="category-tabs-container">
        <div className="category-tabs">
          <button
            onClick={() => setActiveTab("income")}
            className={`category-tab ${activeTab === "income" ? "active-tab income" : ""}`}
          >
            <span className="tab-icon">💰</span>
            <span className="tab-text">Ingresos</span>
          </button>
          <button
            onClick={() => setActiveTab("expense")}
            className={`category-tab ${activeTab === "expense" ? "active-tab expense" : ""}`}
          >
            <span className="tab-icon">💸</span>
            <span className="tab-text">Gastos</span>
          </button>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span> {error}
        </div>
      )}
      {success && (
        <div className="success-message">
          <span className="success-icon">✅</span> {success}
        </div>
      )}

      {/* Sección de contenido */}
      <div className="category-content">
        <h3 className="category-section-title">
          <span className="section-icon">
            {activeTab === "income" ? "📋" : "📋"}
          </span>
          Categorías de {activeTab === "income" ? "Ingresos" : "Gastos"}
        </h3>

        {/* Contenedor de categorías */}
        <div className={`category-chips-container ${animation}`}>
          {categories[activeTab].length === 0 ? (
            <div className="empty-categories">
              <div className="empty-icon">📝</div>
              <p>No hay categorías definidas</p>
              <p className="empty-hint">Añade categorías para organizar tus finanzas</p>
            </div>
          ) : (
            categories[activeTab].map((cat) => (
              <div
                key={cat}
                className={`category-chip ${activeTab === "income" ? "income" : "expense"}`}
              >
                <span className="category-icon">{getCategoryIcon(cat)}</span>
                <span className="category-name">{cat}</span>
                {(cat !== "Otros ingresos" && cat !== "Otros gastos") && (
                  <button
                    onClick={() => handleRemoveCategory(activeTab, cat)}
                    className="delete-category-btn"
                    title="Eliminar categoría"
                  >
                    <span className="delete-icon">×</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Formulario para añadir nueva categoría */}
        <div className="add-category-form">
          <div className="input-with-icon">
            <span className="input-icon">🏷️</span>
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => {
                setNewCatInput(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder={`Nueva categoría de ${activeTab === "income" ? "ingreso" : "gasto"}...`}
              className="form-input with-icon"
            />
          </div>
          <button
            onClick={handleAddCategory}
            disabled={loading}
            className={`btn btn-primary ${loading ? "btn-loading" : ""}`}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                <span>Agregando...</span>
              </>
            ) : (
              <>
                <span className="add-icon">+</span>
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>

        {/* Sugerencias de uso */}
        <div className="category-tips">
          <div className="tip-header">
            <span className="tip-icon">💡</span>
            <h4>Consejos:</h4>
          </div>
          <ul className="tip-list">
            <li>Crea categorías específicas para un mejor análisis de tus finanzas</li>
            <li>Las categorías "Otros ingresos" y "Otros gastos" no se pueden eliminar</li>
            <li>Utiliza nombres claros y concisos para tus categorías</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
