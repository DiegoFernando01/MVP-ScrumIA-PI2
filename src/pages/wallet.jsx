import React, { useState, useEffect } from "react";
import TransactionForm from "../components/wallet/TransactionForm";
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

/**
 * Página principal de billetera
 * Ahora con funcionalidad de presupuestos, alertas y recordatorios
 */
function Wallet() {
  // Usar hooks personalizados
  const categoryManager = useCategories();
  const filterManager = useTransactionFilters();
  const budgetManager = useBudgets();
  const alertManager = useAlerts();
  const reminderManager = useReminders();

  // Estados locales para transacciones y formulario
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    type: "income",
    date: "",
    description: "",
    category: "",
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("transactions"); // Para navegar entre secciones

  // Cargar datos de prueba al inicio
  useEffect(() => {
    setTransactions(generateTestData());
  }, []);

  // Comprobar alertas cuando cambien las transacciones o presupuestos
  useEffect(() => {
    if (transactions.length > 0) {
      // Obtener categorías de gastos con presupuestos
      const expenseCategories = categoryManager.predefinedCategories.expense;

      // Comprobar alertas de presupuesto
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
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateTransaction(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setTransactions([...transactions, { ...formData, id: Date.now() }]);
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
   * Regenera datos de prueba
   */
  const regenerateTestData = () => {
    setTransactions(generateTestData());
    filterManager.resetAllFilters();
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

  // Obtener el conteo total de alertas no leídas (presupuestos + recordatorios)
  const getTotalUnreadAlerts = () => {
    return (
      alertManager.getUnreadCount() + reminderManager.getUnreadReminderCount()
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Selector de pestañas */}
      <div className="flex mb-6 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === "transactions"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Transacciones
        </button>
        <button
          onClick={() => setActiveTab("budgets")}
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === "budgets"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Presupuestos
          {alertManager.getUnreadCount() > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {alertManager.getUnreadCount()}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("reminders")}
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === "reminders"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Vencimientos
          {reminderManager.getUnreadReminderCount() > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {reminderManager.getUnreadReminderCount()}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === "categories"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Categorías
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`py-2 px-4 font-medium whitespace-nowrap ${
            activeTab === "alerts"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Alertas
          {getTotalUnreadAlerts() > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {getTotalUnreadAlerts()}
            </span>
          )}
        </button>
      </div>

      {/* Contenido según la pestaña seleccionada */}
      {activeTab === "transactions" && (
        <>
          {/* Formulario de transacción */}
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

          {/* Lista de transacciones */}
          <div className="mt-6">
            <TransactionList
              transactions={transactions}
              filterProps={filterProps}
              uniqueCategories={getUniqueCategories()}
              regenerateTestData={regenerateTestData}
              calculateBudgetUsage={(category) =>
                budgetManager.calculateBudgetUsage(category, transactions)
              }
              alertProps={alertProps}
            />
          </div>
        </>
      )}

      {activeTab === "budgets" && (
        <BudgetManager
          categories={categoryManager.predefinedCategories.expense}
          budgets={budgetManager.budgets}
          setBudgetForCategory={budgetManager.setBudgetForCategory}
          removeBudgetForCategory={budgetManager.removeBudgetForCategory}
        />
      )}

      {activeTab === "categories" && (
        <CategoryManager
          categories={categoryManager.predefinedCategories}
          removeCategory={categoryManager.removeCategory}
          currentType={formData.type}
        />
      )}

      {activeTab === "alerts" && (
        <AlertManager
          alertConfigs={alertManager.alertConfigs}
          saveAlertConfig={alertManager.saveAlertConfig}
          removeAlertConfig={alertManager.removeAlertConfig}
          toggleAlertConfig={alertManager.toggleAlertConfig}
          categories={categoryManager.predefinedCategories.expense}
        />
      )}

      {activeTab === "reminders" && (
        <ReminderManager reminderHook={reminderManager} />
      )}
    </div>
  );
}

export default Wallet;
