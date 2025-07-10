import formidable from "formidable";
import { AzureOpenAI } from "openai";
import fs from "fs";

import { AzureKeyCredential } from '@azure/core-auth';
import pkg from '@azure-rest/ai-vision-image-analysis';
const createClient = pkg.default;

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 20 * 1024 * 1024,
  multiples: false,
  maxFields: 1,
  filename: (name, ext) => `image_${Date.now()}${ext}`
};

const endpoint = process.env.VISION_ENDPOINT;
const key = process.env.VISION_KEY;
const credential = new AzureKeyCredential(key);
const client = createClient(endpoint, credential);

// OpenAI configuration
const openAIEndpoint = process.env.OPENAI_ENDPOINT;
const openAIApiKey = process.env.OPENAI_API_KEY;
const openAIApiVersion = process.env.OPENAI_API_VERSION;
const openAIDeployment = process.env.OPENAI_DEPLOYMENT;

const features = [
  'Read',
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Only POST allowed" });
  }
  console.log("Procesando solicitud de análisis de imagen...");

  try {
    const { tempFilePath } = await new Promise((resolve, reject) => {
      const form = formidable(formidableConfig);
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        const imageFile = files.image?.[0];
        if (!imageFile) return reject(new Error("No se recibió archivo de imagen"));
        resolve({ tempFilePath: imageFile.filepath });
      });
    });

    console.log("Archivo de imagen recibido y guardado temporalmente en:", tempFilePath);

    const azureResponse = await analyzeImageWithAzure(tempFilePath);

    if (azureResponse.status != 200) {
        throw new Error(`Azure Image Analysis failed with status: ${azureResponse.status}`);
    }
    
    const analysisResult = azureResponse.body;

    console.log("Análisis de imagen completado:", JSON.stringify(analysisResult, null, 2));

    const extractedText = analysisResult?.readResult?.blocks?.map(block => block.lines.map(line => line.text).join(' ')).join('\n') || '';
    //const extractedText = analysisResult.readResult;
    // Procesar el análisis con OpenAI
    console.log(extractedText)
    const textToProcess = extractedText || "No se pudo extraer texto de la imagen";

    const openAIResponse = await proccessImageWithOpenAI(textToProcess);
    console.log("Respuesta de OpenAI procesada:", openAIResponse);

    // Limpieza de archivos temporales
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
        console.error("Error deleting temp file", e);
    }

    res.status(200).json(openAIResponse);
  } catch (err) {
    console.error("Error in handler:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function analyzeImageWithAzure(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`El archivo de entrada no existe: ${imagePath}`);
  }

  const imageBuffer = fs.readFileSync(imagePath);

  console.log("Sending request to Azure Image Analysis");
  const result = await client.path('/imageanalysis:analyze').post({
    body: imageBuffer,
    queryParameters: {
      features: features
    },
    contentType: 'application/octet-stream'
  });

  console.log("Response from Azure Image Analysis status:", result.status);

  return result;
}

async function proccessImageWithOpenAI(textToProcess) {
  try {
    if (!openAIApiKey || !openAIEndpoint || !openAIApiVersion || !openAIDeployment) {
      throw new Error("API key o configuración de Azure OpenAI no encontrada");
    }

    const client = new AzureOpenAI({ apiKey: openAIApiKey, endpoint: openAIEndpoint, apiVersion: openAIApiVersion, deployment: openAIDeployment});
    
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const systemPrompt = `Eres el asistente de una aplicación de finanzas personales. Analiza el resultado del analisis de una imagen y responde únicamente con un JSON según la intención detectada.\n\nHay dos tipos de intenciones principales:\n\n1. CREAR TRANSACCIÓN: Si el contenido de la imagen corresponde a un movimiento financiero, responde:\n{\n  "intent": "CrearTransaccion",\n  "TipoTransaccion": "gasto" o "ingreso",\n  "Monto": valor numérico,\n  "Categoria": una de [Alimentación, Transporte, Vivienda, Entretenimiento, Salud, Educación, Ropa, Servicios, Otros gastos, Salario, Ventas, Inversiones, Préstamo, Regalo, Otros ingresos],\n  "Fecha": formato DD/MM/AAAA,\n  "Descripción": texto descriptivo adicional (opcional)\n}\nRecuerda: Hoy es ${today}.\n\n2. OTRAS CONSULTAS: Si el contenido no corresponde a una transacción, responde:\n{\n  "intent": "None",\n  "TipoTransaccion": "",\n  "Monto": 0,\n  "Categoria": "",\n  "Fecha": "",\n  "Descripción": ""\n}\n\nDevuelve solo el JSON, sin texto adicional.`;

    const result = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: textToProcess }
      ],
      max_tokens: 800,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    const responseContent = result.choices[0].message.content;

    try {
      const parsedResponse = JSON.parse(responseContent);
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
    
          return {
            intent: parsedResponse.intent,
            entities
          };
      } else {
          return {
            intent: parsedResponse.intent || "None",
            entities: []
          };
      }
    } catch (parseError) {
      console.error("Error al parsear la respuesta como JSON:", parseError);
      console.error("Contenido problemático:", responseContent);
      throw new Error("Error al parsear la respuesta de OpenAI como JSON.");
    }

  } catch (err) {
    console.error("Error en OpenAI:", err);
    if (err.message && err.message.includes("content management policy")) {
      console.log("La respuesta fue filtrada por la política de contenido de Azure OpenAI");
       return {
        intent: "None",
        entities: [],
        filteredByContentPolicy: true
      };
    }
    throw err;
  }
}