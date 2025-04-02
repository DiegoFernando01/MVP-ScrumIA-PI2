import React, { useState, useEffect, useRef } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from "chart.js";
import { 
  getCategoryComparisonData, 
  getFormattedData, 
  getTrendData, 
  getWeekdayDistribution 
} from "../../utils/reportUtils"; 
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const Reportes = ({ transactions }) => {
  const [reportType, setReportType] = useState("monthly");
  const [transactionType, setTransactionType] = useState("income");
  const [chartView, setChartView] = useState("bar");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState("category");
  const reportRef = useRef(null);

  useEffect(() => {
    const filtered = transactions.filter((t) => t.type === transactionType);
    setFilteredTransactions(filtered);
  }, [transactionType, transactions]);

  const chartData = getCategoryComparisonData(filteredTransactions, transactionType);
  const timeChartData = getFormattedData(filteredTransactions, reportType);
  const trendData = getTrendData(transactions, 6);
  const weekdayData = getWeekdayDistribution(filteredTransactions, transactionType);
  const categories = [...new Set(filteredTransactions.map((t) => t.category || "Sin categoría"))];

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setIsLoading(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
  
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Reporte_Financiero_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2);
  };

  const renderChart = () => {
    switch(selectedReport) {
      case "category":
        if (chartView === 'bar') {
          return (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  title: {
                    display: true,
                    text: `${transactionType === 'income' ? 'Ingresos' : 'Gastos'} por Categoría`,
                    font: { size: 16, weight: 'bold' }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `$${context.raw.toLocaleString()}`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    ticks: { 
                      autoSkip: true, 
                      maxRotation: 45, 
                      minRotation: 45,
                      font: { size: 12 }
                    },
                    grid: { display: false }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return `$${value.toLocaleString()}`;
                      }
                    },
                    grid: { borderDash: [2] }
                  }
                }
              }}
            />
          );
        } else {
          return (
            <Pie
              data={{
                labels: chartData.labels,
                datasets: chartData.datasets
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    position: "right",
                    labels: { 
                      font: { size: 12 },
                      padding: 20
                    }
                  },
                  title: {
                    display: true,
                    text: `Distribución de ${transactionType === 'income' ? 'Ingresos' : 'Gastos'} por Categoría`,
                    font: { size: 16, weight: 'bold' }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.raw;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          );
        }
      
      case "timeline":
        return (
          <Bar
            data={timeChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                title: {
                  display: true,
                  text: `${transactionType === 'income' ? 'Ingresos' : 'Gastos'} a lo largo del tiempo (${reportType})`,
                  font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `$${context.raw.toLocaleString()}`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  ticks: { 
                    autoSkip: true, 
                    maxRotation: 45, 
                    minRotation: 45,
                  },
                  grid: { display: false }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function (value) {
                      return `$${value.toLocaleString()}`;
                    }
                  }
                }
              }
            }}
          />
        );
      
      case "trend":
        return (
          <Line
            data={trendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                title: {
                  display: true,
                  text: 'Tendencia de Ingresos vs Gastos',
                  font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `$${context.raw.toLocaleString()}`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  ticks: { 
                    autoSkip: true, 
                    maxRotation: 45, 
                    minRotation: 45,
                  },
                  grid: { display: false }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function (value) {
                      return `$${value.toLocaleString()}`;
                    }
                  }
                }
              }
            }}
          />
        );
      
      case "weekday":
        return (
          <Bar
            data={weekdayData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                title: {
                  display: true,
                  text: `Distribución por día de la semana (${transactionType === 'income' ? 'Ingresos' : 'Gastos'})`,
                  font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `$${context.raw.toLocaleString()}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function (value) {
                      return `$${value.toLocaleString()}`;
                    }
                  }
                }
              }
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="reports-container">
      <div className="export-header">
        <h3 className="reports-title">📊 Reportes Financieros</h3>
        <button 
          className="export-btn" 
          onClick={handleExportPDF} 
          disabled={isLoading}
        >
          {isLoading ? "Generando..." : "📄 Exportar a PDF"}
        </button>
      </div>
      <p className="reports-subtitle">
        Visualiza y analiza tus finanzas para tomar mejores decisiones financieras
      </p>

      <div className="reports-filters">
        <div className="reports-filter-group">
          <label className="reports-label">Tipo de Reporte:</label>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="reports-select"
          >
            <option value="category">Por categoría</option>
            <option value="timeline">Línea de tiempo</option>
            <option value="trend">Tendencias</option>
            <option value="weekday">Por día de la semana</option>
          </select>
        </div>

        {selectedReport !== "trend" && (
          <div className="reports-filter-group">
            <label className="reports-label">Tipo de Transacción:</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="reports-select"
            >
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>
        )}

        {selectedReport === "timeline" && (
          <div className="reports-filter-group">
            <label className="reports-label">Periodicidad:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="reports-select"
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
        )}

        {selectedReport === "category" && (
          <div className="reports-filter-group">
            <label className="reports-label">Tipo de Gráfico:</label>
            <select
              value={chartView}
              onChange={(e) => setChartView(e.target.value)}
              className="reports-select"
            >
              <option value="bar">Barras</option>
              <option value="pie">Circular</option>
            </select>
          </div>
        )}
      </div>

      <div id="reportes-pdf" ref={reportRef}>
        <div className="reports-chart">
          <div className="chart-container">
            {renderChart()}
          </div>
        </div>

        {selectedReport === "category" && (
          <div className="reports-table-wrapper">
            <h4 className="reports-table-title">
              📂 Desglose por Categorías - Total: ${calculateTotal()}
            </h4>
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Total</th>
                  <th>% del Total</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => {
                  const total = filteredTransactions
                    .filter((t) => t.category === category)
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                  
                  const percentage = (total / parseFloat(calculateTotal())) * 100;
                  
                  return (
                    <tr key={category || `sin-categoria-${index}`}>
                      <td>
                        <span style={{ 
                          display: 'inline-block', 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: chartData.datasets[0].backgroundColor[index], 
                          marginRight: '8px',
                          borderRadius: '50%' 
                        }}></span>
                        {category || "Sin categoría"}
                      </td>
                      <td>${total.toFixed(2)}</td>
                      <td>{percentage.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;