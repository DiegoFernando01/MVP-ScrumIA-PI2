import React, { useState, useEffect } from "react";
import TransactionForm from "../components/wallet/TransactionForm";
import CategoryManager from "../components/wallet/CategoryManager";
import TransactionList from "../components/wallet/TransactionList";
import useCategories from "../hooks/useCategories";
import useTransactionFilters from "../hooks/useTransactionFilters";
import generateTestData from "../utils/testDataGenerator";
import { validateTransaction } from "../utils/validationUtils";

/**
 * Página principal de billetera
 * Ahora utiliza componentes modulares y hooks personalizados
 */
function Wallet() {
  // Usar hooks personalizados para gestionar categorías y filtros
  const categoryManager = useCategories();
  const filterManager = useTransactionFilters();
  
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

  // Cargar datos de prueba al inicio
  useEffect(() => {
    setTransactions(generateTestData());
  }, []);

  // Obtener categorías únicas para filtros
  const getUniqueCategories = () => {
    const categories = transactions.map(t => t.category).filter(c => c);
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
        category: categoryName
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
    hasActiveFilters: filterManager.hasActiveFilters()
  };

  return (
    <div className="p-4 max-w-md mx-auto">
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

      {/* Administrador de categorías */}
      <div className="mt-6">
        <CategoryManager
          categories={categoryManager.predefinedCategories}
          removeCategory={categoryManager.removeCategory}
          currentType={formData.type}
        />
      </div>

      {/* Lista de transacciones */}
      <div className="mt-6">
        <TransactionList
          transactions={transactions}
          filterProps={filterProps}
          uniqueCategories={getUniqueCategories()}
          regenerateTestData={regenerateTestData}
        />
      </div>
    </div>
  );
}

export default Wallet;
