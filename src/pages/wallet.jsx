import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TransactionForm from "../components/wallet/TransactionForm";
import EditTransactionModal from "../components/wallet/EditTransactionModal";
import CategoryManager from "../components/wallet/CategoryManager";
import TransactionList from "../components/wallet/TransactionList";
import BudgetManager from "../components/wallet/BudgetManager";
import AlertManager from "../components/wallet/AlertManager";
import ReminderManager from "../components/wallet/ReminderManager";
import AlertDisplay from "../components/wallet/AlertDisplay";
import AlertsDropdown from "../components/wallet/AlertsDropdown";
import VoiceRecorder from "../components/wallet/VoiceRecorder";
import VoiceNotification from "../components/wallet/VoiceNotification";
import useCategories from "../hooks/useCategories";
import useTransactionFilters from "../hooks/useTransactionFilters";
import useBudgets from "../hooks/useBudgets";
import useAlerts from "../hooks/useAlerts";
import useReminders from "../hooks/useReminders";
import { validateTransaction } from "../utils/validationUtils";
import useTransactions from "../hooks/useTransactions"; 
import Reportes from "../components/wallet/Reportes";
import { getUserData } from "../services/userService";
import { parseDate } from "../utils/speechIntentMapper";

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
import "../styles/components/wallet/Reports.css";
import "../styles/components/wallet/Reminder.css";


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

  // Estado para navegación y UI
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
  
  // Estado para mostrar alertas flotantes cuando se genera una nueva alerta
  const [floatingAlerts, setFloatingAlerts] = useState([]);
  
  // Estado para rastrear cambios en transacciones que requieren revisar alertas
  const [shouldCheckAlerts, setShouldCheckAlerts] = useState(false);
  
  // Variable para evitar verificaciones de alertas en el primer renderizado
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Estado para almacenar mensajes de procesamiento de voz
  const [voiceMessage, setVoiceMessage] = useState(null);

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

      // Solo marcar para revisar alertas si no es la carga inicial
      if (!isInitialRender) {
        setShouldCheckAlerts(true);
      } else {
        setIsInitialRender(false);
        // Verificar alertas también en la carga inicial para recuperar estado
        setShouldCheckAlerts(true);
      }
    }
  }, [transactions, isInitialRender]);

  // Función para verificar alertas de manera segura
  const checkAlertsIfNeeded = useCallback(() => {
    if (!shouldCheckAlerts || transactions.length === 0) return;
    
    // Comprobar alertas de presupuesto
    const expenseCategories = categoryManager.predefinedCategories.expense;
    const previousAlertCount = alertManager.activeAlerts.length;
    
    // Actualizar todas las alertas de presupuesto
    alertManager.resetBudgetAlerts(); // Limpia alertas de presupuesto existentes
    alertManager.checkBudgetAlerts(expenseCategories, (category) =>
      budgetManager.calculateBudgetUsage(category, transactions)
    );
    
    // Si se generaron nuevas alertas, mostrarlas como flotantes
    const hasNewAlerts = alertManager.activeAlerts.length > previousAlertCount;
    
    if (hasNewAlerts) {
      const newAlerts = alertManager.activeAlerts.slice(
        Math.max(0, previousAlertCount)
      );
      
      setFloatingAlerts(newAlerts);
      
      // Configurar un temporizador para ocultar las alertas flotantes después de 5 segundos
      setTimeout(() => {
        setFloatingAlerts([]);
      }, 5000);
    }
    
    // Resetear la bandera para evitar bucles infinitos
    setShouldCheckAlerts(false);
  }, [shouldCheckAlerts, transactions, budgetManager, alertManager, categoryManager]);

  // Efecto separado para manejar comprobación de alertas
  useEffect(() => {
    checkAlertsIfNeeded();
  }, [checkAlertsIfNeeded]);

  // Escuchar evento para navegar a la pestaña de alertas
  useEffect(() => {
    const handleNavigateToAlerts = () => {
      setActiveTab("alerts");
    };
    
    window.addEventListener('navigate-to-alerts', handleNavigateToAlerts);
    
    return () => {
      window.removeEventListener('navigate-to-alerts', handleNavigateToAlerts);
    };
  }, []);

  // Escuchar eventos de navegación por voz
  useEffect(() => {
    // Manejador para navegar a la pestaña de transacciones
    const handleNavigateToTransactions = () => {
      setActiveTab("transactions");
    };
    
    // Manejador para crear una transacción mediante voz
    const handleVoiceCreateTransaction = (event) => {
      const { transaction } = event.detail;
      
      if (!transaction) return;
      
      console.log("Recibido evento de transacción por voz:", transaction);
      
      // Validar y establecer el tipo de transacción
      const validType = transaction.type === 'income' || transaction.type === 'expense' 
        ? transaction.type 
        : 'expense';
      
      // Validar y establecer la categoría (asegurarse de que existe en las predefinidas)
      let validCategory = '';
      if (transaction.category) {
        const categoryList = validType === 'income' 
          ? categoryManager.predefinedCategories.income
          : categoryManager.predefinedCategories.expense;
        
        const categoryExists = categoryList.some(cat => 
          cat.toLowerCase() === transaction.category.toLowerCase()
        );
        
        if (categoryExists) {
          // Encontrar la categoría con el mismo caso (mayúsculas/minúsculas) que está en la lista
          validCategory = categoryList.find(cat => 
            cat.toLowerCase() === transaction.category.toLowerCase()
          );
        } else {
          // Si la categoría no existe, intentamos agregarla
          const addSuccess = categoryManager.addCategory(validType, transaction.category);
          if (addSuccess) {
            validCategory = transaction.category;
          }
        }
      }
      
      if (!validCategory) {
        setVoiceMessage({
          type: 'error',
          message: `No se pudo determinar una categoría válida de tipo ${validType}. Por favor selecciona una categoría existente.`
        });
        return;
      }
      
      // Validar y establecer la fecha (debe ser una fecha válida en formato YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      let validDate = today;
      
      if (transaction.date && /^\d{4}-\d{2}-\d{2}$/.test(transaction.date)) {
        validDate = transaction.date;
      }
      
      // Validar monto (debe ser un número mayor que cero)
      const amount = parseFloat(transaction.amount);
      if (isNaN(amount) || amount <= 0) {
        setVoiceMessage({
          type: 'error',
          message: 'El monto debe ser un número mayor a cero.'
        });
        return;
      }
      
      // Crear datos de formulario para la transacción
      const newFormData = {
        type: validType,
        amount: amount.toString(),
        category: validCategory,
        date: validDate,
        description: transaction.description || '',
      };
      
      console.log("Datos de transacción validados:", newFormData);
      
      // Verificar si hay errores en la transacción
      const validationErrors = validateTransaction(newFormData);
      if (Object.keys(validationErrors).length > 0) {
        console.error("Errores de validación:", validationErrors);
        setVoiceMessage({
          type: 'error',
          message: `La transacción por voz tiene errores: ${Object.values(validationErrors).join(', ')}`
        });
        return;
      }
      
      // Crear la transacción
      createTransaction(newFormData)
        .then(result => {
          if (result.success) {
            // Mensaje de éxito con formato claro y detallado
            const amount = parseFloat(newFormData.amount);
            const formattedAmount = new Intl.NumberFormat('es-CO', { 
              style: 'currency', 
              currency: 'COP',
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            }).format(amount);
            
            setVoiceMessage({
              type: 'success',
              message: `¡Transacción creada! ${validType === 'income' ? 'Ingreso' : 'Gasto'} de ${formattedAmount} ${validCategory ? `en categoría "${validCategory}"` : ''} registrado correctamente.`
            });
          } else {
            setVoiceMessage({
              type: 'error',
              message: `No se pudo crear la transacción: ${result.error || 'Error desconocido'}`
            });
          }
        })
        .catch(error => {
          setVoiceMessage({
            type: 'error',
            message: `Error al crear la transacción: ${error.message}`
          });
        });
    };
    
    // Manejador para filtrar transacciones mediante voz
    const handleVoiceFilterTransactions = (event) => {
      const { filters } = event.detail;
      
      if (!filters) return;
      
      try {
        // Aplicar filtro por tipo si existe
        if (filters.type) {
          filterManager.setTypeFilter(filters.type);
        }
        
        // Aplicar filtro por categoría si existe
        if (filters.category) {
          filterManager.setCategoryFilter(filters.category);
        }
        
        // Aplicar filtro por rango de fechas si existe
        if (filters.dateRange) {
          const { start, end } = filters.dateRange;
          if (start && end) {
            filterManager.handleDateFilterChange([start, end]);
          } else if (start) {
            filterManager.handleDateFilterChange([start, null]);
          } else if (end) {
            filterManager.handleDateFilterChange([null, end]);
          }
        }
        
        // Mostrar mensaje de éxito con detalles de los filtros aplicados
        let filterDetails = [];
        if (filters.type) {
          filterDetails.push(`tipo: ${filters.type === 'income' ? 'ingresos' : 'gastos'}`);
        }
        if (filters.category) {
          filterDetails.push(`categoría: "${filters.category}"`);
        }
        if (filters.dateRange) {
          if (filters.dateRange.start && filters.dateRange.end) {
            filterDetails.push(`período: del ${formatDate(filters.dateRange.start)} al ${formatDate(filters.dateRange.end)}`);
          } else if (filters.dateRange.start) {
            filterDetails.push(`desde: ${formatDate(filters.dateRange.start)}`);
          } else if (filters.dateRange.end) {
            filterDetails.push(`hasta: ${formatDate(filters.dateRange.end)}`);
          }
        }
        
        setVoiceMessage({
          type: 'info',
          message: `Filtros aplicados: ${filterDetails.join(', ')}`
        });
        
      } catch (error) {
        setVoiceMessage({
          type: 'error',
          message: `Error al aplicar filtros: ${error.message}`
        });
      }
    };
    
    // Registrar manejadores de eventos
    window.addEventListener('navigate-to-transactions', handleNavigateToTransactions);
    window.addEventListener('voice-create-transaction', handleVoiceCreateTransaction);
    window.addEventListener('voice-filter-transactions', handleVoiceFilterTransactions);
    
    // Limpiar manejadores al desmontar
    return () => {
      window.removeEventListener('navigate-to-transactions', handleNavigateToTransactions);
      window.removeEventListener('voice-create-transaction', handleVoiceCreateTransaction);
      window.removeEventListener('voice-filter-transactions', handleVoiceFilterTransactions);
    };
  }, [categoryManager.predefinedCategories, createTransaction, filterManager]);

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
  
    // Si es un gasto, validar que no supere el presupuesto
    let willExceedBudget = false;
    let budgetMessage = "";
    
    if (formData.type === "expense" && formData.category) {
      const usage = budgetManager.calculateBudgetUsage(formData.category, transactions);
      
      if (usage.hasbudget) {
        const nuevoTotal = usage.totalExpenses + Number(formData.amount);
        const presupuesto = usage.budgetAmount;
        
        if (nuevoTotal > presupuesto) {
          willExceedBudget = true;
          budgetMessage = `Esta transacción excederá tu presupuesto para ${formData.category}.`;
        }
      }
    }
    
    // Guardar la transacción 
    const result = await createTransaction(formData);
    
    // Si era un gasto que excede presupuesto, mostrar alerta flotante inmediatamente
    if (willExceedBudget) {
      const newAlert = {
        id: `budget-exceeded-${Date.now()}`,
        type: 'budget-exceeded',
        category: formData.category,
        message: budgetMessage,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setFloatingAlerts([newAlert]);
      
      // Limpiar la alerta después de 5 segundos
      setTimeout(() => {
        setFloatingAlerts([]);
      }, 5000);
    }
    
    // Limpiar el formulario después de guardar
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
    // Si es un gasto, validar que no supere el presupuesto
    if (editedTransaction.type === "expense") {
      const usage = budgetManager.calculateBudgetUsage(
        editedTransaction.category,
        transactions.filter((t) => t.id !== editedTransaction.id) // excluye la que estamos editando
      );
  
      const nuevoTotal = usage.totalExpenses + Number(editedTransaction.amount);
      const presupuesto = usage.budgetAmount;
  
      if (presupuesto > 0 && nuevoTotal > presupuesto) {
        // Mostrar alerta de exceso de presupuesto
        const exceedMsg = `⚠️ Este cambio excede el presupuesto de ${editedTransaction.category}.\n` +
          `Presupuesto: $${presupuesto.toFixed(2)}\n` +
          `Gastos actuales (sin incluir esta transacción): $${usage.totalExpenses.toFixed(2)}\n` +
          `Este cambio: $${Number(editedTransaction.amount).toFixed(2)}`;
        
        // Preguntar al usuario si quiere continuar
        const continuar = window.confirm(exceedMsg + "\n\n¿Deseas continuar de todas formas?");
        if (!continuar) {
          return; // 🚫 No guardar si el usuario cancela
        }
        
        // Preparar alerta flotante si el usuario decide continuar
        setFloatingAlerts([{
          id: `budget-exceeded-edit-${Date.now()}`,
          type: 'budget-exceeded',
          category: editedTransaction.category,
          message: `Has sobrepasado el presupuesto de ${editedTransaction.category} con esta modificación.`,
          timestamp: new Date().toISOString()
        }]);
        
        setTimeout(() => {
          setFloatingAlerts([]);
        }, 5000);
      }
    }
  
    // Guardar si pasa la validación o el usuario confirma
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
    // Buscar la transacción que se va a eliminar
    const transactionToDelete = transactions.find(t => t.id === transactionId);
    
    // Verificar si es una transacción de gasto para posiblemente actualizar alertas
    const needToCheckAlerts = transactionToDelete && 
                            transactionToDelete.type === "expense" && 
                            transactionToDelete.category;
    
    // Eliminar la transacción
    const result = await deleteTransaction(transactionId);
    
    if (result.success) {
      // Si era un gasto, forzar verificación de alertas
      if (needToCheckAlerts) {
        setShouldCheckAlerts(true);
      }
    } else {
      alert("Error al eliminar la transacción");
    }
  };

  /**
   * Alternar estado de la barra lateral
   */
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  /**
   * Maneja los resultados del procesamiento de voz
   */
  const handleIntentDetected = (languageProcessingResult) => {
    // Este método se puede usar para procesar intents directamente en el componente principal
    console.log("Intent detectado:", languageProcessingResult.intent);
    
    // Navegar a la pestaña correspondiente según el intent
    if (languageProcessingResult.intent.toLowerCase() === 'filtrartransacciones' ||
        languageProcessingResult.intent.toLowerCase() === 'creartransaccion' ||
        languageProcessingResult.intent.toLowerCase() === 'consultarsaldo') {
      setActiveTab("transactions");
    } else if (languageProcessingResult.intent.toLowerCase() === 'consultarpresupuesto') {
      setActiveTab("budgets");
    }
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

  // Función para limpiar mensajes de voz
  const clearVoiceMessage = () => {
    setVoiceMessage(null);
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
              <span className="menu-icon" style={{ color: 'inherit' }}>📈</span>
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
            <AlertsDropdown
              alerts={alertManager.activeAlerts}
              reminderAlerts={reminderManager.reminderAlerts}
              markAlertAsRead={alertManager.markAlertAsRead}
              dismissAlert={alertManager.dismissAlert}
              markReminderAlertAsRead={reminderManager.markReminderAlertAsRead}
              dismissReminderAlert={reminderManager.dismissReminderAlert}
            />
            <VoiceRecorder onIntentDetected={handleIntentDetected} />
          </div>
        </div>

        {/* Mostrar mensajes de procesamiento de voz cuando existan */}
        {voiceMessage && (
          <VoiceNotification 
            message={voiceMessage}
            onDismiss={clearVoiceMessage}
            autoHideDuration={6000}
          />
        )}

        {/* Contenido dinámico según la pestaña seleccionada */}
        {renderContent()}
      </div>

      {/* Mostrar alertas flotantes cuando sea necesario */}
      {floatingAlerts.length > 0 && (
        <AlertDisplay
          activeAlerts={floatingAlerts}
          markAlertAsRead={alertManager.markAlertAsRead}
          dismissAlert={(id) => {
            alertManager.dismissAlert(id);
            setFloatingAlerts(prev => prev.filter(alert => alert.id !== id));
          }}
          isFloating={true}
        />
      )}

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
