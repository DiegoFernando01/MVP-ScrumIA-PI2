export const getFormattedData = (transactions, reportType) => {
    const labels = [];
    const data = [];
    
    const groupedData = groupTransactionsByDate(transactions, reportType);
  
    groupedData.forEach((item) => {
      labels.push(item.label);
      data.push(item.total);
    });
  
    return {
      labels,
      datasets: [
        {
          label: "Total",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };
  
  const groupTransactionsByDate = (transactions, reportType) => {
    // Aquí agruparás las transacciones por día, semana o mes
    const result = [];
  
    // Lógica para agrupar las transacciones de acuerdo con el reportType (diario, semanal, mensual)
  
    return result;
  };