import { AzureOpenAI } from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("Método no permitido:", req.method);
    res.setHeader("Allow", "POST");
    return res.status(405).end("Only POST");
  }

  try {
    const { text } = req.body;

    if (!text) {
      console.log("Falta el texto del analisis de la imagen en la solicitud");
      return res.status(400).json({ error: "Falta el texto del analisis de la imagen en la solicitud" });
    }

    const endpoint = process.env.OPENAI_ENDPOINT;
    const apiKey = process.env.OPENAI_API_KEY;
    const apiVersion = process.env.OPENAI_API_VERSION;
    const deployment = process.env.OPENAI_DEPLOYMENT;

    if (!apiKey || !endpoint || !apiVersion || !deployment) {
      console.error("API key o configuración de Azure OpenAI no encontrada");
      return res.status(500).json({ error: "API key o configuración de Azure OpenAI no encontrada"});
    }

    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });

    let systemPrompt, userContent;

    // Construir el prompt para Azure OpenAI
    systemPrompt = `Eres el asistente de una aplicación de finanzas personales. Analiza el contenido del analisis de una imagen y responde únicamente con un JSON según la intención detectada.

Hay dos tipos de intenciones principales:

1. CREAR TRANSACCIÓN: Si el contenido de la imagen corresponde a un movimiento financiero, responde:
{
  "intent": "CrearTransaccion",
  "TipoTransaccion": "gasto" o "ingreso",
  "Monto": valor numérico,
  "Categoria": una de [Alimentación, Transporte, Vivienda, Entretenimiento, Salud, Educación, Ropa, Servicios, Otros gastos, Salario, Ventas, Inversiones, Préstamo, Regalo, Otros ingresos],
  "Fecha": formato DD/MM/AAAA,
  "Descripción": texto descriptivo adicional (opcional)
}
Recuerda: Hoy es 30/06/2025.

2. OTRAS CONSULTAS: Si el contenido no corresponde a una transacción, responde:
{
  "intent": "None",
  "TipoTransaccion": "",
  "Monto": 0,
  "Categoria": "",
  "Fecha": "",
  "Descripción": ""
}

Devuelve solo el JSON, sin texto adicional.`;

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

    const responseContent = result.choices[0].message.content;

    // Intentar parsear la respuesta como JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Error al parsear la respuesta como JSON:", parseError);
      console.error("Contenido problemático:", responseContent);

      return res.status(200).json({
        intent: "None",
        entities: []
      });
    }

    // Procesar según el tipo de intención
    if (parsedResponse.intent === "CrearTransaccion") {
      const entities = [
        { category: "TipoTransaccion", text: parsedResponse.TipoTransaccion || "" },
        { category: "Monto", text: parsedResponse.Monto?.toString() || "0" },
        { category: "Categoria", text: parsedResponse.Categoria || "" },
        { category: "Fecha", text: parsedResponse.Fecha || "" }
      ];

      if (parsedResponse.Descripción && parsedResponse.Descripción.trim() !== "") {
        entities.push({ category: "Descripcion", text: parsedResponse.Descripción });
      }

      const formattedResponse = {
        intent: parsedResponse.intent,
        entities
      };

      return res.status(200).json(formattedResponse);
    } else if (parsedResponse.intent === "NavegacionPestana") {
      const formattedResponse = {
        intent: parsedResponse.intent,
        entities: [
          { category: "pestana", text: parsedResponse.pestana || "" }
        ]
      };

      return res.status(200).json(formattedResponse);
    } else {
      const formattedResponse = {
        intent: parsedResponse.intent || "None",
        entities: []
      };

      return res.status(200).json(formattedResponse);
    }
  } catch (err) {
    console.error("Error en OpenAI:", err);

    if (err.message && err.message.includes("content management policy")) {
      console.log("La respuesta fue filtrada por la política de contenido de Azure OpenAI");

      return res.status(200).json({
        intent: "None",
        entities: [],
        filteredByContentPolicy: true
      });
    }

    return res.status(500).json({ error: err.message });
  }
}
