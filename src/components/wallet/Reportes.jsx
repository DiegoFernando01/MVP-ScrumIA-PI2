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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reportes = ({ transactions }) => {
  const [reportType, setReportType] = useState("monthly");
  const [transactionType, setTransactionType] = useState("income");
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const filtered = transactions.filter((t) => t.type === transactionType);
    setFilteredTransactions(filtered);
  }, [transactionType, transactions]);

  const chartData = getCategoryComparisonData(filteredTransactions, transactionType);
  const categories = [...new Set(filteredTransactions.map((t) => t.category))];

  const handleExportPDF = async () => {
    const reportElement = document.getElementById("reportes-pdf");
    if (!reportElement) return;

    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save("Reporte_Financiero.pdf");
  };

  return (
    <div className="reports-container">
      <div className="export-header">
        <h3 className="reports-title">📊 Reportes Financieros</h3>
        <button className="export-btn" onClick={handleExportPDF}>
          📄 Exportar PDF
        </button>
      </div>
      <p className="reports-subtitle">
        Visualiza tus ingresos y gastos clasificados por categoría
      </p>

      <div className="reports-filters">
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

        <div className="reports-filter-group">
          <label className="reports-label">Ver Reporte:</label>
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
      </div>

      <div id="reportes-pdf">
        <div className="reports-chart">
          <div className="chart-container">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  title: {
                    display: true,
                    text: `${transactionType === 'income' ? 'Ingresos' : 'Gastos'} por Categoría`
                  }
                },
                scales: {
                  x: {
                    ticks: { autoSkip: true, maxRotation: 45, minRotation: 45 }
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
          </div>
        </div>

        <div className="reports-table-wrapper">
          <h4 className="reports-table-title">📂 Comparativa por Categorías</h4>
          <table className="reports-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const total = filteredTransactions
                  .filter((t) => t.category === category)
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                return (
                  <tr key={category}>
                    <td>{category}</td>
                    <td>${total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reportes;