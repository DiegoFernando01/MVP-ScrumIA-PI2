import formidable from "formidable";
import fs from "fs";
import path from "path";
import os from "os";
const { ImageAnalysisClient } = require('@azure-rest/ai-vision-image-analysis');
const createClient = require('@azure-rest/ai-vision-image-analysis').default;
const { AzureKeyCredential } = require('@azure/core-auth');

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 20 * 1024 * 1024,
  multiples: false,
  maxFields: 1,
  filename: (name, ext) => `image_${Date.now()}${ext}`
};

const endpoint = process.env['VISION_ENDPOINT'] || '<your_endpoint>';
const key = process.env['VISION_KEY'] || '<your_key>';
const credential = new AzureKeyCredential(key);

const client = createClient (endpoint, credential);

const features = [
  'Caption',
  'DenseCaptions',
  'Read',
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Only POST allowed" });
  }
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

    const analysisResult = await analyzeImageWithAzure(tempFilePath);

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
