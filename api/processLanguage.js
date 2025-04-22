// api/interpret.js
import { ConversationAnalysisClient } from "@azure/ai-language-conversations";
import { AzureKeyCredential }       from "@azure/core-auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Only POST");
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  // 1) Inicializa el cliente
  const endpoint   = process.env.AZURE_LANGUAGE_ENDPOINT;
  const credential = new AzureKeyCredential(process.env.AZURE_LANGUAGE_KEY);
  const client     = new ConversationAnalysisClient(endpoint, credential);

  try {
    // 2) Construye la tarea de análisis
    const task = {
      kind: "Conversation",             // tipo de tarea CLU
      analysisInput: {
        conversationItem: {
          participantId: "user",        // un ID cualquiera
          id: "1",                      // un ID de mensaje
          text: text                    // lo que transcribiste
        }
      },
      parameters: {
        projectName:   process.env.AZURE_CLU_PROJECT_NAME,
        deploymentName: process.env.AZURE_CLU_DEPLOYMENT_NAME,
        verbose:        true
      }
    };

    // 3) Llama al endpoint
    const result = await client.analyzeConversation(task);

    // 4) Extrae intent y entidades
    const topIntent = result.result.prediction.topIntent;
    const entities  = result.result.prediction.entities;

    console.log("Intent:", topIntent);
    console.log("Entities:", entities);
    
    return res.status(200).json({ intent: topIntent, entities });
  } catch (err) {
    console.error("CLU error:", err);
    return res.status(500).json({ error: err.message });
  }
}