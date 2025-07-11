// api/processLanguage.js
import { AzureOpenAI } from "openai";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("❌ Método no permitido:", req.method);
    res.setHeader("Allow", "POST");
    return res.status(405).end("Only POST");
  }

  const { text } = req.body;
  if (!text) {
    console.log("❌ Falta el texto en la solicitud");
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  try {
    // Inicializar el cliente de Azure OpenAI usando las variables existentes
    const endpoint = process.env.OPENAI_ENDPOINT;
    const apiKey = process.env.OPENAI_API_KEY;
    const apiVersion = process.env.OPENAI_API_VERSION;
    const deployment = process.env.OPENAI_DEPLOYMENT;

    // Verificar que la clave API existe
    if (!apiKey) {
      console.error("❌ API key no encontrada");
      return res.status(500).json({ error: "API key no configurada" });
    }

    const client = new AzureOpenAI({ 
      endpoint, 
      apiKey, 
      apiVersion,
      deployment 
    });
    
    // Modificar la instrucción del sistema para incluir la nueva intención de navegación
    const systemPrompt = `Eres el asistente de una aplicación de finanzas personales. Analiza la consulta del usuario y responde únicamente con un JSON según la intención detectada.

Hay tres tipos de intenciones principales:

1. CREAR TRANSACCIÓN: Si el usuario quiere registrar un movimiento financiero, responde:
{
  "intent": "CrearTransaccion",
  "TipoTransaccion": "gasto" o "ingreso",
  "Monto": valor numérico,
  "Categoria": una de [Alimentación, Transporte, Vivienda, Entretenimiento, Salud, Educación, Ropa, Servicios, Otros gastos, Salario, Ventas, Inversiones, Préstamo, Regalo, Otros ingresos],
  "Fecha": formato DD/MM/AAAA,
  "Descripción": texto descriptivo adicional (opcional)
}
Recuerda: Hoy es 23/04/2025.

2. NAVEGAR ENTRE PESTAÑAS: Si el usuario quiere moverse a una sección de la app, responde:
{
  "intent": "NavegacionPestana",
  "pestana": "transacciones" | "presupuestos" | "categorias" | "vencimientos" | "alertas" | "reportes"
}
Las pestañas disponibles son: transacciones, presupuestos, categorias, vencimientos, alertas, reportes. Si el usuario dice frases como "ir a", "abrir", "mostrar", "ver" seguido del nombre de una sección, responde con esta intención y la pestaña correspondiente.

3. OTRAS CONSULTAS: Si la consulta no corresponde a las anteriores, responde:
{
  "intent": "None",
  "TipoTransaccion": "",
  "Monto": 0,
  "Categoria": "",
  "Fecha": "",
  "Descripción": ""
}

Devuelve solo el JSON, sin texto adicional.`;

    // Construir la solicitud al modelo con el nuevo prompt
    const result = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      max_tokens: 800,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    // Extraer la respuesta y convertirla a JSON
    const responseContent = result.choices[0].message.content;

    // Intentar parsear la respuesta como JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("❌ Error al parsear la respuesta como JSON:", parseError);
      console.error("Contenido problemático:", responseContent);
      
      // Si no se puede parsear, intentamos generar una respuesta default
      return res.status(200).json({
        intent: "None",
        entities: []
      });
    }

    // Procesamos según el tipo de intención
    if (parsedResponse.intent === "CrearTransaccion") {
      // Mapear la respuesta al formato esperado por el cliente para transacciones
      const entities = [
        { category: "TipoTransaccion", text: parsedResponse.TipoTransaccion || "" },
        { category: "Monto", text: parsedResponse.Monto?.toString() || "0" },
        { category: "Categoria", text: parsedResponse.Categoria || "" },
        { category: "Fecha", text: parsedResponse.Fecha || "" }
      ];
      
      // Agregar descripción si existe
      if (parsedResponse.Descripción && parsedResponse.Descripción.trim() !== "") {
        entities.push({ category: "Descripcion", text: parsedResponse.Descripción });
      }

      const formattedResponse = { 
        intent: parsedResponse.intent, 
        entities 
      };
      
      return res.status(200).json(formattedResponse);
    } 
    else if (parsedResponse.intent === "NavegacionPestana") {
      // Mapear la respuesta para la navegación entre pestañas
      const formattedResponse = {
        intent: parsedResponse.intent,
        entities: [
          { category: "pestana", text: parsedResponse.pestana || "" }
        ]
      };
      
      return res.status(200).json(formattedResponse);
    }
    else {
      // Si no es una transacción o navegación, o es "None", devolver una respuesta básica
      const formattedResponse = {
        intent: parsedResponse.intent || "None",
        entities: []
      };
      
      return res.status(200).json(formattedResponse);
    }
  } catch (err) {
    console.error("❌ Error en OpenAI:", err);

    // Manejar específicamente el error de filtro de contenido
    if (err.message && err.message.includes("content management policy")) {
      console.log("⚠️ La respuesta fue filtrada por la política de contenido de Azure OpenAI");
      
      // Devolver una respuesta genérica en lugar de un error
      return res.status(200).json({
        intent: "None",
        entities: [],
        filteredByContentPolicy: true
      });
    }

    // Para cualquier otro error, registrar detalles y devolver error 500
    return res.status(500).json({ error: err.message });
  }
}
