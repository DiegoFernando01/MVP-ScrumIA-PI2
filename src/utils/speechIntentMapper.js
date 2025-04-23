/**
 * Utilidades para mapear intents de lenguaje natural a acciones de la aplicación
 */

// Diccionario de días relativos a fechas absolutas
const relativeDates = {
  'ayer': -1,
  'hoy': 0,
  'mañana': 1,
  'pasado mañana': 2,
  'anteayer': -2
};

// Mapeo de palabras específicas de dinero en español
const moneyTerms = {
  'melón': 1000000,
  'melones': 1000000,
  'palo': 1000000,
  'palos': 1000000,
  'kilo': 1000,
  'kilos': 1000,
  'luca': 1000,
  'lucas': 1000,
  'barra': 1000,
  'barras': 1000,
  'gamba': 100,
  'gambas': 100
};

/**
 * Convierte una expresión de fecha relativa a una fecha absoluta
 * @param {string} dateText - Texto de la fecha (ej: "ayer", "15 de abril", etc)
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export function parseDate(dateText) {
  if (!dateText) return '';
  
  // Convertir texto a minúsculas para facilitar comparaciones
  const lowerText = dateText.toLowerCase().trim().replace(/\.$/, '');
  
  // Comprobar si es una fecha relativa conocida
  if (lowerText in relativeDates) {
    const today = new Date();
    const daysToAdd = relativeDates[lowerText];
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    return targetDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
  
  // Procesar fechas en formato DD/MM/YYYY o DD/MM/AAAA
  const dateSlashRegex = /^(\d{1,2})[\/](\d{1,2})[\/](\d{4})$/;
  const matchSlash = dateText.match(dateSlashRegex);
  
  if (matchSlash) {
    const day = parseInt(matchSlash[1], 10);
    const month = parseInt(matchSlash[2], 10) - 1; // Meses en JavaScript son 0-indexed
    const year = parseInt(matchSlash[3], 10);
    
    // Crear la fecha y validarla
    const date = new Date(year, month, day);
    
    // Verificar que la fecha sea válida
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }
  }
  
  // Procesar fechas en formato "15 de abril de 2025"
  const dateRegex = /(\d{1,2})(?:\s+de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?:\s+de\s+)?(\d{4})?/i;
  const match = lowerText.match(dateRegex);
  
  if (match) {
    const day = parseInt(match[1], 10);
    
    // Mapeo de nombres de meses a números
    const monthNames = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 
      'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7, 
      'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    
    const month = monthNames[match[2].toLowerCase()];
    // Si no se proporciona el año, usar el actual o el próximo si la fecha ya pasó
    let year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
    
    const currentDate = new Date();
    const specifiedDate = new Date(year, month, day);
    
    // Si la fecha ya pasó y no especificó año, asumir el próximo año
    if (!match[3] && specifiedDate < currentDate) {
      specifiedDate.setFullYear(currentDate.getFullYear() + 1);
    }
    
    return specifiedDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
  
  // Si no se pudo procesar, devolver fecha actual
  console.warn('No se pudo procesar la fecha:', dateText);
  return new Date().toISOString().split('T')[0];
}

/**
 * Procesa el texto de un monto y devuelve su valor numérico
 * @param {string} amountText - Texto del monto (ej: "50000", "2 melones", etc)
 * @returns {number} - Valor numérico del monto
 */
export function parseAmount(amountText) {
  if (!amountText) return 0;
  
  // Limpiar el texto
  const text = amountText.toLowerCase().trim()
    .replace(/\./g, '')  // Eliminar puntos de miles
    .replace(/,/g, '.'); // Cambiar comas decimales por puntos

  // Elimina la palabra "pesos" si existe
  const cleanedText = text.replace(/\s+pesos$/, '');
  
  // Intentar extraer un número explícito primero
  const numMatch = cleanedText.match(/(\d+(\.\d+)?)/);
  if (numMatch) {
    const numValue = parseFloat(numMatch[0]);
    
    // Buscar si hay términos especiales después del número
    for (const [term, multiplier] of Object.entries(moneyTerms)) {
      if (cleanedText.includes(term)) {
        return numValue * multiplier;
      }
    }
    
    return numValue;
  }
  
  // Si no hay un número explícito, buscar términos especiales
  for (const [term, value] of Object.entries(moneyTerms)) {
    if (cleanedText.includes(term)) {
      // Si encuentra "un melón" o similar
      if (cleanedText.match(/\bun\s+/)) {
        return value;
      }
      // Para casos como "dos melones", etc.
      const wordToNumberMap = {
        'un': 1, 'uno': 1, 'una': 1,
        'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 
        'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
        'medio': 0.5, 'media': 0.5
      };
      
      for (const [word, num] of Object.entries(wordToNumberMap)) {
        if (cleanedText.includes(word + ' ')) {
          return num * value;
        }
      }
      
      // Si no encuentra un número específico, asumir 1
      return value;
    }
  }
  
  // Si no coincide con ningún patrón conocido, intentar convertir directamente
  return parseFloat(cleanedText) || 0;
}

/**
 * Limpia y normaliza el texto de la categoría
 * @param {string} categoryText - Texto de la categoría
 * @returns {string} - Categoría limpia
 */
export function parseCategory(categoryText) {
  if (!categoryText) return '';
  
  // Eliminar "para" al final si existe
  let cleaned = categoryText.replace(/\s+para\s*$/, '');
  
  // Eliminar preposiciones al final
  cleaned = cleaned.replace(/\s+(en|de|del|por)\s*$/, '');
  
  // Eliminar espacios extras
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Ejecuta acciones basadas en intents y entities del procesamiento de lenguaje
 */
export function executeIntentAction(intent, entities, callbacks) {
  if (!intent || !entities || !callbacks) {
    console.error('Se requieren intent, entities y callbacks para ejecutar acciones');
    return null;
  }
  
  // Mapeo de entidades a un objeto estructurado
  const entityMap = {};
  entities.forEach(entity => {
    entityMap[entity.category] = entity.text;
  });

  // Acciones según el tipo de intent
  switch (intent.toLowerCase()) {
    case 'navegacionpestana':
      return handleTabNavigation(entityMap, callbacks);
      
    case 'creartransaccion':
      return handleCreateTransaction(entityMap, callbacks);
      
    case 'filtrartransacciones':
      return handleFilterTransactions(entityMap, callbacks);
      
    case 'consultarsaldo':
      return handleCheckBalance(entityMap, callbacks);
      
    case 'consultargastos':
      return handleCheckExpenses(entityMap, callbacks);
      
    case 'consultaringresos':
      return handleCheckIncomes(entityMap, callbacks);
      
    default:
      console.warn('Intent no reconocido:', intent);
      return {
        success: false,
        message: `No se reconoció la acción "${intent}"`
      };
  }
}

/**
 * Maneja la creación de una nueva transacción
 */
function handleCreateTransaction(entityMap, callbacks) {
  // Validar que existan las callbacks necesarias
  if (!callbacks.onCreateTransaction) {
    return { success: false, message: 'No se proporcionó manejador para crear transacciones' };
  }
  
  // Extraer y procesar los valores de las entidades
  const tipo = entityMap.TipoTransaccion?.toLowerCase() || 'expense';
  const montoTexto = entityMap.Monto;
  const categoriaTexto = entityMap.Categoria;
  const fechaTexto = entityMap.Fecha;
  const descripcion = entityMap.Descripcion || '';
  
  // Procesar los valores
  const transactionType = tipo.includes('ingreso') ? 'income' : 'expense';
  const amount = parseAmount(montoTexto);
  const categoria = parseCategory(categoriaTexto);
  const date = parseDate(fechaTexto);
  
  console.log('Parseando transacción:', { 
    tipo, 
    montoTexto, 
    categoriaTexto, 
    fechaTexto, 
    procesado: { 
      transactionType, 
      amount, 
      categoria, 
      date 
    } 
  });
  
  // Si no hay monto o está en cero, no podemos crear la transacción
  if (!amount) {
    return {
      success: false,
      message: 'No se pudo determinar el monto de la transacción'
    };
  }
  
  // Crear el objeto de transacción
  const transaction = {
    type: transactionType,
    amount: amount.toString(),
    category: categoria || '',
    date: date,
    description: descripcion
  };
  
  try {
    // Llamar a la función para crear la transacción
    callbacks.onCreateTransaction(transaction);
    
    return {
      success: true,
      message: `Se ha creado ${transactionType === 'income' ? 'un ingreso' : 'un gasto'} de $${amount.toFixed(2)} ${categoria ? `en ${categoria}` : ''}`,
      data: transaction
    };
  } catch (error) {
    console.error('Error al crear transacción:', error);
    return {
      success: false,
      message: 'Ocurrió un error al intentar crear la transacción'
    };
  }
}

/**
 * Maneja el filtrado de transacciones
 */
function handleFilterTransactions(entityMap, callbacks) {
  if (!callbacks.onFilterTransactions) {
    return { success: false, message: 'No se proporcionó manejador para filtrar transacciones' };
  }
  
  // Extraer entidades relevantes para filtrado
  const tipo = entityMap.TipoTransaccion?.toLowerCase();
  const categoriaTexto = entityMap.Categoria;
  const fechaInicio = entityMap.FechaInicio;
  const fechaFin = entityMap.FechaFin;
  const montoTexto = entityMap.Monto;
  
  // Procesar valores
  const categoria = parseCategory(categoriaTexto);
  
  // Crear objeto de filtros
  const filters = {};
  
  if (tipo) {
    filters.type = tipo.includes('ingreso') ? 'income' : 'expense';
  }
  
  if (categoria) {
    filters.category = categoria;
  }
  
  if (fechaInicio || fechaFin) {
    filters.dateRange = {
      start: fechaInicio ? parseDate(fechaInicio) : undefined,
      end: fechaFin ? parseDate(fechaFin) : undefined
    };
  }
  
  if (montoTexto) {
    filters.amount = parseAmount(montoTexto);
  }
  
  try {
    // Aplicar filtros
    callbacks.onFilterTransactions(filters);
    
    return {
      success: true,
      message: 'Filtros aplicados correctamente',
      data: filters
    };
  } catch (error) {
    console.error('Error al aplicar filtros:', error);
    return {
      success: false, 
      message: 'Ocurrió un error al intentar aplicar los filtros'
    };
  }
}

/**
 * Maneja la consulta del saldo actual
 */
function handleCheckBalance(entityMap, callbacks) {
  if (!callbacks.onCheckBalance) {
    return { success: false, message: 'No se proporcionó manejador para consultar saldo' };
  }
  
  try {
    const balance = callbacks.onCheckBalance();
    return {
      success: true,
      message: `Tu saldo actual es $${balance.toFixed(2)}`,
      data: { balance }
    };
  } catch (error) {
    console.error('Error al consultar saldo:', error);
    return { 
      success: false, 
      message: 'Ocurrió un error al consultar el saldo'
    };
  }
}

/**
 * Maneja la consulta de gastos
 */
function handleCheckExpenses(entityMap, callbacks) {
  if (!callbacks.onCheckExpenses) {
    return { success: false, message: 'No se proporcionó manejador para consultar gastos' };
  }
  
  const categoriaTexto = entityMap.Categoria;
  const categoria = parseCategory(categoriaTexto);
  const periodo = entityMap.Periodo?.toLowerCase();
  
  try {
    const expenses = callbacks.onCheckExpenses(categoria, periodo);
    
    let message = `Tus gastos totales son $${expenses.total.toFixed(2)}`;
    if (categoria) {
      message = `Tus gastos en ${categoria} son $${expenses.total.toFixed(2)}`;
    }
    if (periodo) {
      message += ` en ${periodo}`;
    }
    
    return {
      success: true,
      message,
      data: expenses
    };
  } catch (error) {
    console.error('Error al consultar gastos:', error);
    return { 
      success: false, 
      message: 'Ocurrió un error al consultar los gastos'
    };
  }
}

/**
 * Maneja la consulta de ingresos
 */
function handleCheckIncomes(entityMap, callbacks) {
  if (!callbacks.onCheckIncomes) {
    return { success: false, message: 'No se proporcionó manejador para consultar ingresos' };
  }
  
  const categoriaTexto = entityMap.Categoria;
  const categoria = parseCategory(categoriaTexto);
  const periodo = entityMap.Periodo?.toLowerCase();
  
  try {
    const incomes = callbacks.onCheckIncomes(categoria, periodo);
    
    let message = `Tus ingresos totales son $${incomes.total.toFixed(2)}`;
    if (categoria) {
      message = `Tus ingresos en ${categoria} son $${incomes.total.toFixed(2)}`;
    }
    if (periodo) {
      message += ` en ${periodo}`;
    }
    
    return {
      success: true,
      message,
      data: incomes
    };
  } catch (error) {
    console.error('Error al consultar ingresos:', error);
    return { 
      success: false, 
      message: 'Ocurrió un error al consultar los ingresos'
    };
  }
}

/**
 * Maneja la navegación a una pestaña específica
 */
function handleTabNavigation(entityMap, callbacks) {
  if (!callbacks.onNavigateToTab) {
    return { 
      success: false, 
      message: 'No se proporcionó manejador para navegación entre pestañas' 
    };
  }
  
  const tabName = entityMap.pestana?.toLowerCase();
  
  if (!tabName) {
    return {
      success: false,
      message: 'No se especificó la pestaña a la que deseas ir'
    };
  }
  
  try {
    // Mapear los nombres de pestañas a identificadores del sistema
    const tabMap = {
      'transacciones': 'transactions',
      'presupuestos': 'budgets',
      'presupuesto': 'budgets',
      'categorias': 'categories',
      'categorías': 'categories',
      'categoría': 'categories',
      'categoria': 'categories',
      'vencimientos': 'reminders',
      'vencimiento': 'reminders',
      'recordatorios': 'reminders',
      'recordatorio': 'reminders',
      'alertas': 'alerts',
      'alerta': 'alerts',
      'reportes': 'reports',
      'reporte': 'reports',
      'informe': 'reports',
      'informes': 'reports'
    };
    
    const tabId = tabMap[tabName] || tabName;
    
    callbacks.onNavigateToTab(tabId);
    
    return {
      success: true,
      message: `Navegando a la pestaña ${tabName}`,
      data: { tabId }
    };
  } catch (error) {
    console.error('Error al navegar a pestaña:', error);
    return {
      success: false,
      message: 'Ocurrió un error al intentar navegar a la pestaña solicitada'
    };
  }
}