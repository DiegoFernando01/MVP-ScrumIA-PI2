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

  // Ordenar categorías por monto (de mayor a menor)
  const sortedCategories = Object.keys(categoryTotals).sort(
    (a, b) => categoryTotals[b] - categoryTotals[a]
  );

  const labels = sortedCategories;
  const data = sortedCategories.map(category => categoryTotals[category]);

  // Generar colores para cada categoría
  const backgroundColors = generateColorPalette(labels.length, 0.7);
  const borderColors = generateColorPalette(labels.length, 1);

  return {
    labels,
    datasets: [
      {
        label: `Totales por categoría (${transactionType === "income" ? "Ingresos" : "Gastos"})`,
        data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };
};

// Agrupación por fecha para futuros reportes
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

  // Ordenar cronológicamente las fechas
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (type === "daily") {
      return new Date(a) - new Date(b);
    } else if (type === "weekly") {
      return new Date(a.replace("Semana de ", "")) - new Date(b.replace("Semana de ", ""));
    } else {
      const [monthA, yearA] = a.split("/");
      const [monthB, yearB] = b.split("/");
      return new Date(`${yearA}-${monthA}`) - new Date(`${yearB}-${monthB}`);
    }
  });

  const labels = sortedKeys;
  const data = sortedKeys.map(key => grouped[key]);

  return {
    labels,
    datasets: [
      {
        label: "Totales por período",
        data,
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };
};

// Función auxiliar para generar paleta de colores
function generateColorPalette(count, alpha = 1) {
  const colors = [];
  
  // Colores predefinidos para las primeras categorías
  const baseColors = [
    [75, 192, 192],   // Verde azulado
    [255, 99, 132],   // Rosa
    [54, 162, 235],   // Azul
    [255, 206, 86],   // Amarillo
    [153, 102, 255],  // Púrpura
    [255, 159, 64],   // Naranja
    [22, 160, 133],   // Verde esmeralda
    [142, 68, 173],   // Púrpura oscuro
    [41, 128, 185],   // Azul acero
    [243, 156, 18],   // Ámbar
  ];

  // Usar colores de la paleta base o generar aleatorios si hay más categorías
  for (let i = 0; i < count; i++) {
    if (i < baseColors.length) {
      const [r, g, b] = baseColors[i];
      colors.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
    } else {
      // Generar colores aleatorios para categorías adicionales
      const r = Math.floor(Math.random() * 200) + 55;
      const g = Math.floor(Math.random() * 200) + 55;
      const b = Math.floor(Math.random() * 200) + 55;
      colors.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
    }
  }
  
  return colors;
}

// Obtener datos de tendencia por mes
export const getTrendData = (transactions, months = 6) => {
  const today = new Date();
  const result = {
    income: {},
    expense: {}
  };

  // Crear meses para el rango
  for (let i = 0; i < months; i++) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getMonth() + 1}/${d.getFullYear()}`;
    
    result.income[monthKey] = 0;
    result.expense[monthKey] = 0;
  }

  // Agrupar transacciones por mes y tipo
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (result[t.type] && result[t.type][monthKey] !== undefined) {
      result[t.type][monthKey] += parseFloat(t.amount);
    }
  });

  // Convertir a formato para gráfico
  const sortedMonths = Object.keys(result.income)
    .sort((a, b) => {
      const [monthA, yearA] = a.split('/');
      const [monthB, yearB] = b.split('/');
      return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });

  const labels = sortedMonths.map(month => {
    const [m, y] = month.split('/');
    const date = new Date(y, m - 1);
    return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  });

  return {
    labels,
    datasets: [
      {
        label: 'Ingresos',
        data: sortedMonths.map(month => result.income[month]),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Gastos',
        data: sortedMonths.map(month => result.expense[month]),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
  };
};

// Obtener distribución de transacciones por día de la semana
export const getWeekdayDistribution = (transactions, transactionType = "all") => {
  const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const totals = Array(7).fill(0);
  
  const filteredTransactions = transactionType === "all" 
    ? transactions 
    : transactions.filter(t => t.type === transactionType);
  
  filteredTransactions.forEach(t => {
    const date = new Date(t.date);
    const day = date.getDay(); // 0 = domingo, 6 = sábado
    totals[day] += parseFloat(t.amount);
  });
  
  return {
    labels: weekdays,
    datasets: [
      {
        label: `${transactionType === "all" ? "Todas las transacciones" : 
                transactionType === "income" ? "Ingresos" : "Gastos"} por día de la semana`,
        data: totals,
        backgroundColor: generateColorPalette(7, 0.7),
        borderColor: generateColorPalette(7, 1),
        borderWidth: 1,
      }
    ]
  };
};
