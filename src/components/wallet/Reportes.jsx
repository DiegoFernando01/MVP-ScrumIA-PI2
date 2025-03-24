import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";
import { getCategoryComparisonData } from "../../utils/reportUtils"; // ✅ usamos la correcta

ChartJS.register(CategoryScale, LinearScale, BarElement);

const Reportes = ({ transactions }) => {
  const [reportType, setReportType] = useState("monthly"); // Por si quieres usarlo en el futuro
  const [transactionType, setTransactionType] = useState("income"); // Ingresos o Gastos
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Filtrar las transacciones según el tipo seleccionado (ingresos o gastos)
  useEffect(() => {
    const filtered = transactions.filter((t) => t.type === transactionType);
    setFilteredTransactions(filtered);
  }, [transactionType, transactions]);

  // Obtener datos del gráfico por categoría
  const chartData = getCategoryComparisonData(filteredTransactions, transactionType);
  const categories = [...new Set(filteredTransactions.map((t) => t.category))];

  return (
    <div>
      <h3>Reportes Financieros</h3>

      <div className="flex gap-4">
        <div>
          <label>Tipo de Transacción:</label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="border p-2"
          >
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
        </div>

        <div>
          <label>Ver reporte:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border p-2"
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="mt-4">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "top"
              }
            },
            scales: {
              y: {
                min: 0,
                max: 1000000,
                ticks: {
                  stepSize: 100000,
                  callback: function (value) {
                    return `$${value.toLocaleString()}`;
                  }
                }
              }
            }
          }}
        />
      </div>

      {/* Tabla comparativa */}
      <div className="mt-6">
        <h4>Comparativa por Categorías</h4>
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Categoría</th>
              <th className="px-4 py-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const total = filteredTransactions
                .filter((t) => t.category === category)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
              return (
                <tr key={category}>
                  <td className="px-4 py-2 border">{category}</td>
                  <td className="px-4 py-2 border">${total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reportes;
