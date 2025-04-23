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
    const endpoint = process.env.OPENAI_ENDPOINT || "https://diego-m9tayqx3-eastus2.openai.azure.com/";
    const apiKey = process.env.OPENAI_API_KEY;
    const apiVersion = process.env.OPENAI_API_VERSION || "2024-04-01-preview";
    const deployment = process.env.OPENAI_DEPLOYMENT || "gpt-4o";

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
    
    // Modificar la instrucción del sistema para evitar filtros de contenido e incluir fecha actual
    const systemPrompt = `Estás trabajando para una aplicación de gestión financiera. Para las consultas relacionadas con registrar movimientos financieros, responde únicamente con un objeto JSON que contenga las siguientes propiedades:

1. "intent" - La intención identificada (CrearTransaccion, None, etc.)
2. "TipoTransaccion" - Si es "gasto" o "ingreso"
3. "Monto" - Valor numérico sin formato de moneda
4. "Categoria" - Categoría del movimiento según las listas proporcionadas
5. "Fecha" - En formato DD/MM/AAAA
6. "Descripción" - Texto descriptivo adicional (opcional)

Debes tener claro cuál es la fecha del día en curso, al momento de registrar esta información, estamos a 23/04/2025.

Para gastos, las categorías válidas son: Alimentación, Transporte, Vivienda, Entretenimiento, Salud, Educación, Ropa, Servicios, Otros gastos. 
Para ingresos: Salario, Ventas, Inversiones, Préstamo, Regalo, Otros ingresos.

Si la consulta no corresponde a un registro financiero, responde:
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

    // Si el intent es "CrearTransaccion", convertirlo a formato compatible con el cliente
    if (parsedResponse.intent === "CrearTransaccion") {
      // Mapear la respuesta al formato esperado por el cliente
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
    } else {
      // Si no es una transacción o es "None", devolver una respuesta básica
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
