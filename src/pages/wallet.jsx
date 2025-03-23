import React, { useState, useEffect } from "react";
import TransactionForm from "../components/wallet/TransactionForm";
import CategoryManager from "../components/wallet/CategoryManager";
import TransactionList from "../components/wallet/TransactionList";
import BudgetManager from "../components/wallet/BudgetManager";
import AlertManager from "../components/wallet/AlertManager";
import useCategories from "../hooks/useCategories";
import useTransactionFilters from "../hooks/useTransactionFilters";
import useBudgets from "../hooks/useBudgets";
import useAlerts from "../hooks/useAlerts";
import generateTestData from "../utils/testDataGenerator";
import { validateTransaction } from "../utils/validationUtils";

/**
 * Página principal de billetera
 * Ahora con funcionalidad de presupuestos y alertas
 */
function Wallet() {
  // Usar hooks personalizados
  const categoryManager = useCategories();
  const filterManager = useTransactionFilters();
  const budgetManager = useBudgets();
  const alertManager = useAlerts();

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

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Selector de pestañas */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`py-2 px-4 font-medium ${
            activeTab === "transactions"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Transacciones
        </button>
        <button
          onClick={() => setActiveTab("budgets")}
          className={`py-2 px-4 font-medium ${
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
          onClick={() => setActiveTab("categories")}
          className={`py-2 px-4 font-medium ${
            activeTab === "categories"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Categorías
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`py-2 px-4 font-medium ${
            activeTab === "alerts"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Alertas
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
    </div>
  );
}

export default Wallet;
