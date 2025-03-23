/**
 * Genera datos de prueba para demostración
 * @returns {Array} Transacciones aleatorias generadas
 */
export const generateTestData = () => {
  const categories = {
    income: ["Salario", "Ventas", "Inversiones", "Préstamo", "Regalo"],
    expense: [
      "Alimentación",
      "Transporte",
      "Vivienda",
      "Entretenimiento",
      "Salud",
      "Educación",
      "Ropa",
    ],
  };

  const descriptions = {
    income: [
      "Pago mensual",
      "Venta de artículo",
      "Dividendos",
      "Devolución de impuestos",
      "Trabajo freelance",
    ],
    expense: [
      "Compra supermercado",
      "Taxi",
      "Pago de alquiler",
      "Cine",
      "Farmacia",
      "Curso online",
      "Restaurante",
    ],
  };

  // Generar fecha aleatoria en los últimos 90 días
  const getRandomDate = () => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * 90));
    return pastDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  };

  // Crear 20 transacciones aleatorias
  const testData = [];
  for (let i = 0; i < 20; i++) {
    const type = Math.random() > 0.5 ? "income" : "expense";
    const category =
      categories[type][Math.floor(Math.random() * categories[type].length)];
    const description =
      descriptions[type][Math.floor(Math.random() * descriptions[type].length)];

    testData.push({
      id: Date.now() + i,
      type: type,
      amount: (Math.random() * 990 + 10).toFixed(2),
      date: getRandomDate(),
      description: description,
      category: category,
    });
  }

  // Ordenar por fecha, más recientes primero
  return testData.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export default generateTestData;
