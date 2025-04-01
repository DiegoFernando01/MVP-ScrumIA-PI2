import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { getCategoryComparisonData } from "../../utils/reportUtils"; 

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

  // Función para obtener el monto total de las transacciones filtradas
  const getTotalAmount = () => {
    return filteredTransactions.reduce((total, t) => total + parseFloat(t.amount), 0);
  };

  // Colores para el gráfico
  const backgroundColors = [
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(199, 199, 199, 0.6)',
    'rgba(83, 102, 255, 0.6)',
    'rgba(40, 159, 143, 0.6)',
    'rgba(210, 105, 30, 0.6)'
  ];

  // Agregar colores a los datos del gráfico
  if (chartData && chartData.datasets && chartData.datasets.length > 0) {
    chartData.datasets[0].backgroundColor = backgroundColors.slice(0, chartData.labels.length);
    chartData.datasets[0].borderColor = backgroundColors.map(color => color.replace('0.6', '1'));
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6 rounded-lg shadow-lg">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-700 flex items-center">
            <span className="mr-2">📊</span> Reportes Financieros
          </h2>
          
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
            Total: ${getTotalAmount().toFixed(2)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tarjeta de filtros */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="mr-2">🔍</span> Filtros
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Transacción:
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTransactionType("income")}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      transactionType === "income"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    }`}
                    style={{ backgroundColor: transactionType === "income" ? "rgb(220 252 231)" : "rgb(243 244 246)" }}
                  >
                    <span className="mr-1">💰</span> Ingresos
                  </button>
                  <button
                    onClick={() => setTransactionType("expense")}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      transactionType === "expense"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                    }`}
                    style={{ backgroundColor: transactionType === "expense" ? "rgb(254 226 226)" : "rgb(243 244 246)" }}
                  >
                    <span className="mr-1">💸</span> Gastos
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período de Tiempo:
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  style={{ backgroundColor: "white" }}
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tarjeta de resumen */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="mr-2">📋</span> Resumen
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Categorías:</span>
                <span className="font-medium text-purple-700">{categories.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transacciones:</span>
                <span className="font-medium text-purple-700">{filteredTransactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Promedio:</span>
                <span className="font-medium text-purple-700">
                  ${filteredTransactions.length ? (getTotalAmount() / filteredTransactions.length).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                <span className="text-gray-800 font-semibold">Total:</span>
                <span className={`font-bold text-lg ${
                  transactionType === "income" ? "text-green-600" : "text-red-600"
                }`}>
                  ${getTotalAmount().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de barras con mejor formato */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
            <span className="mr-2">📈</span> 
            {`${transactionType === 'income' ? 'Ingresos' : 'Gastos'} por Categoría`}
          </h3>
          <div className="chart-container" style={{ position: 'relative', height: '400px', width: '100%' }}>
            {chartData.labels.length > 0 ? (
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `$${context.raw.toFixed(2)}`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        autoSkip: true,
                        maxRotation: 45,
                        minRotation: 45
                      }
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        borderDash: [2, 4]
                      },
                      ticks: {
                        callback: function (value) {
                          return `$${value.toLocaleString()}`;
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No hay datos disponibles</h3>
                <p className="text-gray-500">Registra transacciones para visualizar estadísticas</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabla comparativa mejorada */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
            <span className="mr-2">📋</span> Comparativa por Categorías
          </h3>
          {categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2 bg-gray-100 text-left text-gray-600 rounded-tl-lg">Categoría</th>
                    <th className="px-4 py-2 bg-gray-100 text-right text-gray-600">Total</th>
                    <th className="px-4 py-2 bg-gray-100 text-right text-gray-600 rounded-tr-lg">% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => {
                    const total = filteredTransactions
                      .filter((t) => t.category === category)
                      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                    const percentage = (total / getTotalAmount() * 100).toFixed(1);
                    
                    return (
                      <tr key={category} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 border-b border-gray-200 font-medium flex items-center">
                          <span className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: backgroundColors[index % backgroundColors.length].replace('0.6', '0.8') }}>
                          </span>
                          {category || "Sin categoría"}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200 text-right font-medium">
                          ${total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200 text-right">
                          <div className="flex items-center justify-end">
                            <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div className="h-2.5 rounded-full" 
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: backgroundColors[index % backgroundColors.length].replace('0.6', '0.8')
                                }}>
                              </div>
                            </div>
                            <span>{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-gray-700 rounded-bl-lg">Total</td>
                    <td className="px-4 py-3 font-bold text-right text-purple-700">
                      ${getTotalAmount().toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-right text-gray-700 rounded-br-lg">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500">No hay categorías disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
