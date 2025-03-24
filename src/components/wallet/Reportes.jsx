import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from "chart.js";
import { getFormattedData } from "../../utils/reportUtils";

ChartJS.register(CategoryScale, LinearScale, BarElement);

const Reportes = ({ transactions }) => {
  const [reportType, setReportType] = useState("monthly"); // Mensual, semanal, diario
  const [transactionType, setTransactionType] = useState("income"); // Ingresos o Gastos
  const [categoryData, setCategoryData] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Función para filtrar las transacciones según el tipo (ingreso o gasto)
  useEffect(() => {
    const filtered = transactions.filter(
      (t) => t.type === transactionType
    );
    setFilteredTransactions(filtered);
  }, [transactionType, transactions]);

  // Función para manejar los cambios en el tipo de reporte
  const handleReportChange = (e) => {
    setReportType(e.target.value);
  };

  // Función para manejar los cambios en el tipo de transacción (ingreso o gasto)
  const handleTransactionChange = (e) => {
    setTransactionType(e.target.value);
  };

  // Generación de los datos del gráfico y la tabla comparativa
  const chartData = getFormattedData(filteredTransactions, reportType); // Aquí formateas los datos según el tipo de reporte
  const categories = [...new Set(filteredTransactions.map((t) => t.category))]; // Categorías únicas para la tabla

  return (
    <div>
      <h3>Reportes Financieros</h3>

      <div className="flex gap-4">
        {/* Select para elegir el tipo de transacción (Ingresos/Gastos) */}
        <div>
          <label>Tipo de Transacción:</label>
          <select
            value={transactionType}
            onChange={handleTransactionChange}
            className="border p-2"
          >
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
        </div>

        {/* Select para elegir el tipo de reporte (Diario, Semanal, Mensual) */}
        <div>
          <label>Ver reporte:</label>
          <select
            value={reportType}
            onChange={handleReportChange}
            className="border p-2"
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>
      </div>

      {/* Gráfico de Reportes */}
      <div className="mt-4">
      <Bar
            data={chartData}
            options={{
                responsive: true,
                plugins: {
                legend: {
                    position: "top",
                },
                },
                scales: {
                y: {
                    min: 0, // Mínimo valor del eje Y
                    max: 1000000, // Máximo valor del eje Y (1 millón)
                    ticks: {
                    stepSize: 100000, // Este valor establece el intervalo entre cada marca (puedes ajustarlo según tus necesidades)
                    },
                },
                },
            }}
            />
      </div>

      {/* Tabla Comparativa por Categorías */}
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
              const categoryTransactions = filteredTransactions.filter(
                (t) => t.category === category
              );
              const total = categoryTransactions.reduce(
                (sum, transaction) => sum + parseFloat(transaction.amount),
                0
              );
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
