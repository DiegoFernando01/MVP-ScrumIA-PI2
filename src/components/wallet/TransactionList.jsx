import React, { useState } from "react";
import FilterPanel from "./FilterPanel";
import TransactionItem from "./TransactionItem";

const TransactionList = ({
  transactions,
  filterProps,
  uniqueCategories,
  calculateBudgetUsage,
  alertProps,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Calcular totales para mostrar
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  return (
    <div className="transaction-container">
      <div className="transaction-header">
        <div className="transaction-summary">
          <div className="summary-item">
            <span className="summary-label">Filtrados:</span>
            <span className="summary-value">{filterProps.filteredTransactions.length} de {transactions.length}</span>
          </div>
          
          {filterProps.hasActiveFilters && (
            <>
              <div className="summary-item">
                <span className="summary-label">Ingresos:</span>
                <span className="summary-value income">$ {filterProps.filteredTransactions
                  .filter(t => t.type === "income")
                  .reduce((acc, t) => acc + parseFloat(t.amount), 0)
                  .toFixed(2)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Gastos:</span>
                <span className="summary-value expense">$ {filterProps.filteredTransactions
                  .filter(t => t.type === "expense")
                  .reduce((acc, t) => acc + parseFloat(t.amount), 0)
                  .toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
        
        <div className="transaction-actions">
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="filter-icon">{showFilters ? '✕' : '🔍'}</span>
            <span>{showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <FilterPanel
          categoryFilter={filterProps.categoryFilter}
          setCategoryFilter={filterProps.setCategoryFilter}
          typeFilter={filterProps.typeFilter}
          setTypeFilter={filterProps.setTypeFilter}
          dateFilter={filterProps.dateFilter}
          handleDateFilterChange={filterProps.handleDateFilterChange}
          clearDateFilter={filterProps.clearDateFilter}
          uniqueCategories={uniqueCategories}
          hasActiveFilters={filterProps.hasActiveFilters}
          searchText={filterProps.searchText}
          setSearchText={filterProps.setSearchText}
          sortBy={filterProps.sortBy}
          setSortBy={filterProps.setSortBy}
          resetAllFilters={filterProps.resetAllFilters}
        />
      )}

      <div className="transaction-list-container">
        {filterProps.filteredTransactions.length > 0 ? (
          <div className="transaction-list">
            {filterProps.filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                calculateBudgetUsage={(category) =>
                  calculateBudgetUsage(category, transactions)
                }
                onEdit={() => onEditTransaction(transaction)}
                onDelete={() => onDeleteTransaction(transaction.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No hay transacciones</h3>
            <p>{filterProps.hasActiveFilters
              ? "No se encontraron transacciones que coincidan con los filtros aplicados."
              : "Añade tu primera transacción usando el formulario superior."
            }</p>
            {filterProps.hasActiveFilters && (
              <button 
                className="btn-filter btn-filter-primary" 
                onClick={filterProps.resetAllFilters}
              >
                <span>🔄</span> Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
