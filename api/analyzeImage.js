import formidable from "formidable";
import { AzureOpenAI } from "openai";
import fs from "fs";
import path from "path";
import os from "os";

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

// OpenAI configuration
const openAIEndpoint = process.env.OPENAI_ENDPOINT;
const openAIApiKey = process.env.OPENAI_API_KEY;
const openAIApiVersion = process.env.OPENAI_API_VERSION;
const openAIDeployment = process.env.OPENAI_DEPLOYMENT;

const client = createClient (endpoint, credential);

const features = [
  'Caption',
  'Read',
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Only POST allowed" });
  }
  console.log("Procesando solicitud de análisis de imagen...");

  try {
    const { imageBuffer, tempFilePath } = await new Promise((resolve, reject) => {
      const form = formidable(formidableConfig);
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        const imageFile = files.image?.[0];
        if (!imageFile) return reject(new Error("No se recibió archivo de imagen"));
        try {
          const data = fs.readFileSync(imageFile.filepath);
          resolve({
            imageBuffer: data,
            tempFilePath: imageFile.filepath
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    console.log("Archivo de imagen recibido y guardado temporalmente en:", tempFilePath);

    const analysisResult = await analyzeImageWithAzure(tempFilePath).readResult;

    console.log("Análisis de imagen completado:", analysisResult);

    // Procesar el análisis con OpenAI
    const text = analysisResult || "No se pudo extraer texto de la imagen";

    //const openAIResponse = await proccessImageWithOpenAI(text);
    //console.log("Respuesta de OpenAI procesada:", openAIResponse);

    // Limpieza de archivos temporales
    try {
      fs.unlinkSync(tempFilePath);
    } catch {}

    res.status(200).json({ analysis: analysisResult });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function analyzeImageWithAzure(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`El archivo de entrada no existe: ${imagePath}`);
  }

  const imageBuffer = fs.readFileSync(imagePath);

  const result = await client.path('/imageanalysis:analyze').post({
    body: imageBuffer,
    queryParameters: {
      features: features
    },
    contentType: 'application/octet-stream'
  });

  return result.body;
}

async function proccessImageWithOpenAI(analysisResult) {
  try {
    if (!openAIApiKey || !openAIEndpoint || !openAIApiVersion || !openAIDeployment) {
      console.error("API key o configuración de Azure OpenAI no encontrada");
      return res.status(500).json({ error: "API key o configuración de Azure OpenAI no encontrada"});
    }

    const client = new AzureOpenAI({ openAIApiKey, openAIEndpoint, openAIApiVersion, openAIDeployment });

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

      return "Error al parsear la respuesta como JSON:" + parseError.message;
      /*
      return res.status(200).json({
        intent: "None",
        entities: []
      });
      */
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
      return formattedResponse;
      //return res.status(200).json(formattedResponse);
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
      /*
      return res.status(200).json({
        intent: "None",
        entities: [],
        filteredByContentPolicy: true
      });
      */
    }
    return "La respuesta fue filtrada por la política de contenido de Azure OpenAI"
    //return res.status(500).json({ error: err.message });
  }
}