// Agrupación por categoría para gráfico comparativo
export const getCategoryComparisonData = (transactions, transactionType = "income") => {
  const categoryTotals = {};

  transactions
    .filter((t) => t.type === transactionType)
    .forEach((t) => {
      const category = t.category || "Sin categoría";
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += parseFloat(t.amount);
    });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  return {
    labels,
    datasets: [
      {
        label: `Totales por categoría (${transactionType === "income" ? "Ingresos" : "Gastos"})`,
        data,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };
};

// (Opcional) Agrupación por fecha para futuros reportes
export const getFormattedData = (transactions, type = "monthly") => {
  const grouped = {};

  transactions.forEach((t) => {
    const date = new Date(t.date);
    let key = "";

    switch (type) {
      case "daily":
        key = date.toLocaleDateString();
        break;
      case "weekly":
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = `Semana de ${startOfWeek.toLocaleDateString()}`;
        break;
      case "monthly":
      default:
        key = `${date.getMonth() + 1}/${date.getFullYear()}`;
        break;
    }

    if (!grouped[key]) grouped[key] = 0;
    grouped[key] += parseFloat(t.amount);
  });

  return {
    labels: Object.keys(grouped),
    datasets: [
      {
        label: "Totales por período",
        data: Object.values(grouped),
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };
};
