import React from "react";
import FilterPanel from "./FilterPanel";
import TransactionItem from "./TransactionItem";
import AlertDisplay from "./AlertDisplay";

/**
 * Lista de transacciones con filtros
 */
const TransactionList = ({
  transactions,
  filterProps,
  uniqueCategories,
  regenerateTestData,
  calculateBudgetUsage,
  alertProps,
}) => {
  const { filteredTransactions, hasActiveFilters, ...filters } = filterProps;

  return (
    <div>
      {/* Mostrar alertas si hay */}
      {alertProps && alertProps.activeAlerts.length > 0 && (
        <AlertDisplay
          activeAlerts={alertProps.activeAlerts}
          markAlertAsRead={alertProps.markAlertAsRead}
          dismissAlert={alertProps.dismissAlert}
        />
      )}

      <div className="mb-4">
        {/* Encabezado y botón de prueba */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Transacciones</h2>
          <button
            onClick={regenerateTestData}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700"
          >
            Regenerar datos de prueba
          </button>
        </div>

        {/* Panel de filtros */}
        <FilterPanel
          {...filters}
          uniqueCategories={uniqueCategories}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Lista de transacciones */}
      {filteredTransactions.length === 0 ? (
        <p className="text-gray-500">
          {transactions.length === 0
            ? "Aún no hay transacciones registradas."
            : "No hay transacciones que coincidan con los filtros seleccionados."}
        </p>
      ) : (
        <ul className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              budgetUsage={
                transaction.type === "expense" && transaction.category
                  ? calculateBudgetUsage(transaction.category, transactions)
                  : null
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;
