import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TransactionForm from "../components/wallet/TransactionForm";
import EditTransactionModal from "../components/wallet/EditTransactionModal";
import CategoryManager from "../components/wallet/CategoryManager";
import TransactionList from "../components/wallet/TransactionList";
import BudgetManager from "../components/wallet/BudgetManager";
import AlertManager from "../components/wallet/AlertManager";
import ReminderManager from "../components/wallet/ReminderManager";
import useCategories from "../hooks/useCategories";
import useTransactionFilters from "../hooks/useTransactionFilters";
import useBudgets from "../hooks/useBudgets";
import useAlerts from "../hooks/useAlerts";
import useReminders from "../hooks/useReminders";
import generateTestData from "../utils/testDataGenerator";
import { validateTransaction } from "../utils/validationUtils";
import useTransactions from "../hooks/useTransactions"; 
import Reportes from "../components/wallet/Reportes";
import { getUserData } from "../services/userService";

// Importación de estilos modularizados
import "../styles/components/wallet/Common.css";
import "../styles/components/wallet/Sidebar.css";
import "../styles/components/wallet/Cards.css";
import "../styles/components/wallet/Transaction.css";
import "../styles/components/wallet/Form.css";
import "../styles/components/wallet/FilterPanel.css";
import "../styles/components/wallet/Budget.css";
import "../styles/components/wallet/Modal.css";
import "../styles/components/wallet/Alert.css";
import "../styles/components/wallet/Category.css";

/**
 * Página principal de billetera
 * Ahora con funcionalidad de presupuestos, alertas, recordatorios
 * y edición/eliminación de transacciones
 */
function Wallet() {
  // Usar hooks personalizados
  const categoryManager = useCategories();
  const filterManager = useTransactionFilters();
  const budgetManager = useBudgets();
  const alertManager = useAlerts();
  const reminderManager = useReminders();

  // Hooks para autenticación y navegación
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Estados locales para transacciones y formulario
  const {
    transactions,
    createTransaction,
    editTransaction,
    deleteTransaction,
    loading: loadingTransactions,
  } = useTransactions();
  
  const [formData, setFormData] = useState({
    amount: "",
    type: "income",
    date: "",
    description: "",
    category: "",
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("transactions"); // Para navegar entre secciones
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Para controlar el estado de la barra lateral

  // Estado para manejar la edición de transacciones
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Estado para almacenar el nombre de usuario
  const [userName, setUserName] = useState("");
  
  // Estado para calcular totales
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    recentTransactions: []
  });

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserName = async () => {
      const data = await getUserData();
      if (data) {
        setUserName(`${data.firstName} ${data.lastName}`);
      }
    };
  
    fetchUserName();
  }, []);

  // Calcular estadísticas cuando cambien las transacciones
  useEffect(() => {
    if (transactions.length > 0) {
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);
      
      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);
      
      // Ordenar por fecha descendente y tomar las 5 más recientes
      const recent = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      setStats({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        recentTransactions: recent
      });

      // Comprobar alertas de presupuesto
      const expenseCategories = categoryManager.predefinedCategories.expense;
      alertManager.checkBudgetAlerts(expenseCategories, (category) =>
        budgetManager.calculateBudgetUsage(category, transactions)
      );
    }
  }, [transactions, budgetManager.budgets]);

  // Obtener categorías únicas para filtros
  const getUniqueCategories = () => {
    const categories = transactions.map((t) => t.category).filter((c) => c);
    return [...new Set(categories)];
  };

  /**
   * Maneja cambios en campos del formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Resetear categoría cuando cambia el tipo
    if (name === "type") {
      setFormData({
        ...formData,
        [name]: value,
        category: "", // Resetear categoría
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateTransaction(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    await createTransaction(formData); // con Firebase
    setFormData({
      amount: "",
      type: "income",
      date: "",
      description: "",
      category: "",
    });
    setErrors({});
  };

  /**
   * Limpia el formulario
   */
  const handleClear = () => {
    setFormData({
      amount: "",
      type: "income",
      date: "",
      description: "",
      category: "",
    });
    setErrors({});
  };

  /**
   * Añade una nueva categoría y la selecciona
   */
  const addNewCategory = (type, categoryName) => {
    const success = categoryManager.addCategory(type, categoryName);
    if (success) {
      setFormData({
        ...formData,
        category: categoryName,
      });
    }
    return success;
  };

  /**
   * Maneja la edición de una transacción
   */
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  /**
   * Guarda los cambios realizados a una transacción
   */
  const handleSaveEditedTransaction = async (editedTransaction) => {
    const result = await editTransaction(editedTransaction.id, editedTransaction);
    if (result.success) {
      setEditingTransaction(null);
    } else {
      alert("Error al actualizar la transacción");
    }
  };

  /**
   * Cancela la edición de una transacción
   */
  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  /**
   * Maneja el cierre de sesión
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); // Redirigir al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  /**
   * Elimina una transacción
   */
  const handleDeleteTransaction = async (transactionId) => {
    const result = await deleteTransaction(transactionId);
    if (!result.success) {
      alert("Error al eliminar la transacción");
    }
  };

  /**
   * Alternar estado de la barra lateral
   */
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Obtener el conteo total de alertas no leídas (presupuestos + recordatorios)
  const getTotalUnreadAlerts = () => {
    return alertManager.getUnreadCount() + reminderManager.getUnreadReminderCount();
  };

  // Filtrar transacciones según criterios seleccionados
  const filteredTransactions = filterManager.filterTransactions(transactions);

  // Props para el panel de filtros
  const filterProps = {
    ...filterManager,
    filteredTransactions,
    hasActiveFilters: filterManager.hasActiveFilters(),
  };

  // Props para alertas
  const alertProps = {
    activeAlerts: alertManager.activeAlerts,
    markAlertAsRead: alertManager.markAlertAsRead,
    dismissAlert: alertManager.dismissAlert,
  };

  /**
   * Renderizar el contenido según la pestaña seleccionada
   */
  const renderContent = () => {
    switch (activeTab) {
      case "transactions":
        return (
          <>
            <div className="cards-container">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Ingresos Totales</h3>
                  <div className="card-icon income">
                    <span>💰</span>
                  </div>
                </div>
                <div className="card-content">
                  <h4 className="card-value">$ {stats.totalIncome.toFixed(2)}</h4>
                  <p className="card-label">Total ingresos acumulados</p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Gastos Totales</h3>
                  <div className="card-icon expense">
                    <span>💸</span>
                  </div>
                </div>
                <div className="card-content">
                  <h4 className="card-value">$ {stats.totalExpense.toFixed(2)}</h4>
                  <p className="card-label">Total gastos acumulados</p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Balance Actual</h3>
                  <div className="card-icon">
                    <span>⚖️</span>
                  </div>
                </div>
                <div className="card-content">
                  <h4 className={`card-value ${stats.balance >= 0 ? 'amount-income' : 'amount-expense'}`}>
                    $ {stats.balance.toFixed(2)}
                  </h4>
                  <p className="card-label">Ingresos - Gastos</p>
                </div>
              </div>
            </div>
            
            <div className="wallet-section">
              <div className="section-header">
                <h3 className="section-title">Agregar Transacción</h3>
              </div>
              <TransactionForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleClear={handleClear}
                errors={errors}
                categories={categoryManager.predefinedCategories}
                newCategoryInput={categoryManager.newCategoryInput}
                setNewCategoryInput={categoryManager.setNewCategoryInput}
                showNewCategoryInput={categoryManager.showNewCategoryInput}
                setShowNewCategoryInput={categoryManager.setShowNewCategoryInput}
                addNewCategory={addNewCategory}
              />
            </div>
            
            <div className="wallet-section">
              <div className="section-header">
                <h3 className="section-title">Historial de Transacciones</h3>
              </div>
              <TransactionList
                transactions={transactions}
                filterProps={filterProps}
                uniqueCategories={getUniqueCategories()}
                calculateBudgetUsage={(category) =>
                  budgetManager.calculateBudgetUsage(category, transactions)
                }
                alertProps={alertProps}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          </>
        );
      
      case "budgets":
        return (
          <div className="wallet-section">
            <div className="section-header">
              <h3 className="section-title">Gestión de Presupuestos</h3>
            </div>
            <BudgetManager
              categories={categoryManager.predefinedCategories.expense}
              budgets={budgetManager.budgets}
              setBudgetForCategory={budgetManager.setBudgetForCategory}
              removeBudgetForCategory={budgetManager.removeBudgetForCategory}
            />
          </div>
        );
      
      case "categories":
        return (
          <div className="wallet-section">
            <div className="section-header">
              <h3 className="section-title">Administrar Categorías</h3>
            </div>
            <CategoryManager
              categories={categoryManager.predefinedCategories}
              removeCategory={categoryManager.removeCategory}
              currentType={formData.type}
              addCategory={categoryManager.addCategory} 
            />
          </div>
        );
      
      case "alerts":
        return (
          <div className="wallet-section">
            <div className="section-header">
              <h3 className="section-title">Configuración de Alertas</h3>
            </div>
            <AlertManager
              alertConfigs={alertManager.alertConfigs}
              saveAlertConfig={alertManager.saveAlertConfig}
              removeAlertConfig={alertManager.removeAlertConfig}
              toggleAlertConfig={alertManager.toggleAlertConfig}
              categories={categoryManager.predefinedCategories.expense}
            />
          </div>
        );
      
      case "reminders":
        return (
          <div className="wallet-section">
            <div className="section-header">
              <h3 className="section-title">Recordatorios de Pagos</h3>
            </div>
            <ReminderManager reminderHook={reminderManager} />
          </div>
        );
      
      case "reports":
        return (
          <div className="wallet-section">
            <div className="section-header">
              <h3 className="section-title">Reportes Financieros</h3>
            </div>
            <Reportes transactions={transactions} />
          </div>
        );
      
      default:
        return <div>Selecciona una opción del menú</div>;
    }
  };

  // Formatear iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (!userName) return "U";
    return userName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="wallet-container">
      {/* Barra lateral */}
      <div className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="app-logo">💰</div>
            <span className="app-name">SmartWallet</span>
          </div>
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <ul className="sidebar-menu">
          <li className="menu-item">
            <a 
              className={`menu-link ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab("transactions")}
            >
              <span className="menu-icon">💵</span>
              <span className="menu-text">Transacciones</span>
            </a>
          </li>
          <li className="menu-item">
            <a 
              className={`menu-link ${activeTab === 'budgets' ? 'active' : ''}`}
              onClick={() => setActiveTab("budgets")}
            >
              <span className="menu-icon">📊</span>
              <span className="menu-text">Presupuestos</span>
              {alertManager.getUnreadCount() > 0 && (
                <span className="badge">{alertManager.getUnreadCount()}</span>
              )}
            </a>
          </li>
          <li className="menu-item">
            <a 
              className={`menu-link ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab("categories")}
            >
              <span className="menu-icon">🏷️</span>
              <span className="menu-text">Categorías</span>
            </a>
          </li>
          <li className="menu-item">
            <a 
              className={`menu-link ${activeTab === 'reminders' ? 'active' : ''}`}
              onClick={() => setActiveTab("reminders")}
            >
              <span className="menu-icon">📅</span>
              <span className="menu-text">Vencimientos</span>
              {reminderManager.getUnreadReminderCount() > 0 && (
                <span className="badge">{reminderManager.getUnreadReminderCount()}</span>
              )}
            </a>
          </li>
          <li className="menu-item">
            <a 
              className={`menu-link ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab("alerts")}
            >
              <span className="menu-icon">🔔</span>
              <span className="menu-text">Alertas</span>
              {getTotalUnreadAlerts() > 0 && (
                <span className="badge">{getTotalUnreadAlerts()}</span>
              )}
            </a>
          </li>
          <li className="menu-item">
            <a 
              className={`menu-link ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab("reports")}
            >
              <span className="menu-icon">📈</span>
              <span className="menu-text">Reportes</span>
            </a>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {getUserInitials()}
            </div>
            <div className="user-details">
              <p className="user-name">{userName || 'Usuario'}</p>
              <p className="user-role">Cuenta Personal</p>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={`main-content ${sidebarCollapsed ? 'main-content-expanded' : ''}`}>
        <div className="page-header">
          <div className="welcome-header">
            <h1 className="welcome-heading">Bienvenido, {userName || 'Usuario'}!</h1>
            <p className="welcome-subheading">Gestiona tus finanzas de manera inteligente</p>
          </div>
          <div className="header-actions">
            {getTotalUnreadAlerts() > 0 && (
              <button className="notification-button">
                <span>🔔</span>
                <span className="notification-badge">{getTotalUnreadAlerts()}</span>
              </button>
            )}
          </div>
        </div>

        {/* Contenido dinámico según la pestaña seleccionada */}
        {renderContent()}
      </div>

      {/* Modal de edición de transacción */}
      {editingTransaction && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Editar Transacción</h3>
              <button className="modal-close" onClick={handleCancelEdit}>×</button>
            </div>
            <div className="modal-body">
              <EditTransactionModal
                transaction={editingTransaction}
                onSave={handleSaveEditedTransaction}
                onCancel={handleCancelEdit}
                categories={categoryManager.predefinedCategories}
                newCategoryInput={categoryManager.newCategoryInput}
                setNewCategoryInput={categoryManager.setNewCategoryInput}
                showNewCategoryInput={categoryManager.showNewCategoryInput}
                setShowNewCategoryInput={categoryManager.setShowNewCategoryInput}
                addNewCategory={addNewCategory}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wallet;
