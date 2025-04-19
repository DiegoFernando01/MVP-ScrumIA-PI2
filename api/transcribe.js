import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { Buffer } from 'buffer';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

// Configurar ffmpeg con la ruta de instalación
ffmpeg.setFfmpegPath(ffmpegPath.path);

// Configurar formidable para que no guarde archivos en disco y acepte archivos más grandes
const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 20 * 1024 * 1024, // 20MB
  multiples: false,
  maxFields: 1,
  filename: (name, ext) => {
    return `audio_${Date.now()}${ext}`;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    console.log("Recibiendo solicitud de transcripción...");
    
    // Comprobar si las credenciales de Azure Speech están configuradas
    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
      console.error("Faltan credenciales de Azure Speech");
      return res.status(500).json({ 
        error: "Faltan credenciales de Azure Speech. Verifique las variables de entorno AZURE_SPEECH_KEY y AZURE_SPEECH_REGION." 
      });
    }
    
    // Procesar el formulario con formidable
    const form = formidable(formidableConfig);
    
    // Usar Promise para manejar formidable de forma asíncrona
    const { audioBuffer, audioType } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Error al procesar el FormData:", err);
          return reject(err);
        }
        
        // Verificar si hay un archivo de audio
        const audioFile = files.audio?.[0];
        
        if (!audioFile) {
          return reject(new Error("No se recibió archivo de audio"));
        }
        
        const audioType = fields.audioType?.[0] || audioFile.mimetype;
        
        console.log("Archivo recibido:", {
          size: audioFile.size,
          type: audioType,
          name: audioFile.originalFilename,
          path: audioFile.filepath
        });
        
        // Leer el contenido del archivo en un buffer
        try {
          const data = fs.readFileSync(audioFile.filepath);
          
          // No eliminamos el archivo temporal todavía, lo necesitaremos para la conversión
          resolve({ audioBuffer: data, audioType, tempFilePath: audioFile.filepath });
        } catch (fileErr) {
          reject(new Error(`Error al leer el archivo: ${fileErr.message}`));
        }
      });
    });
    
    try {
      // Siempre realizamos la conversión para asegurarnos de tener un archivo WAV válido
      console.log("Iniciando conversión a formato WAV...");
      const wavFilePath = await convertToWav(audioBuffer.tempFilePath || generateTempFilePath(audioType), audioType);
      
      // Leer el archivo WAV generado
      const wavBuffer = fs.readFileSync(wavFilePath);
      console.log(`Conversión exitosa. Archivo WAV generado: ${wavFilePath}, tamaño: ${wavBuffer.length} bytes`);
      
      // Procesar el audio con Azure Speech
      const result = await processAudioWithAzure(wavBuffer, res);
      
      // Limpiar archivos temporales después de procesar
      try {
        if (fs.existsSync(wavFilePath)) fs.unlinkSync(wavFilePath);
        if (audioBuffer.tempFilePath && fs.existsSync(audioBuffer.tempFilePath)) {
          fs.unlinkSync(audioBuffer.tempFilePath);
        }
      } catch (cleanupErr) {
        console.error("Error al eliminar archivos temporales:", cleanupErr);
      }
      
      return result;
    } catch (conversionError) {
      console.error("Error en la conversión del audio:", conversionError);
      return res.status(500).json({ error: `Error en la conversión del audio: ${conversionError.message}` });
    }
    
  } catch (error) {
    console.error("Error en la API de transcripción:", error);
    return res.status(500).json({ error: `Transcription error: ${error.message}` });
  }
}

// Función para generar una ruta de archivo temporal
function generateTempFilePath(audioType) {
  const tempDir = os.tmpdir();
  const extension = audioType.includes('webm') ? '.webm' : 
                   audioType.includes('mp4') ? '.mp4' : '.audio';
  const tempPath = path.join(tempDir, `input_${Date.now()}${extension}`);
  return tempPath;
}

// Función para convertir audio a WAV usando ffmpeg
async function convertToWav(inputFilePath, audioType) {
  console.log(`Convirtiendo audio desde ${inputFilePath} (${audioType}) a WAV...`);
  
  // Crear ruta para el archivo de salida
  const outputFile = path.join(os.tmpdir(), `output_${Date.now()}.wav`);
  
  // Si no existe el archivo de entrada (caso raro), escribir el buffer
  if (!fs.existsSync(inputFilePath) && Buffer.isBuffer(inputFilePath)) {
    const tempInputFile = generateTempFilePath(audioType);
    fs.writeFileSync(tempInputFile, inputFilePath);
    inputFilePath = tempInputFile;
  }
  
  // Verificar que el archivo de entrada existe
  if (!fs.existsSync(inputFilePath)) {
    throw new Error(`El archivo de entrada no existe: ${inputFilePath}`);
  }
  
  // Realizar la conversión con configuración explícita para WAV
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .output(outputFile)
      .noVideo()
      .audioChannels(1)               // Mono
      .audioFrequency(16000)          // 16 KHz
      .audioCodec('pcm_s16le')        // PCM 16-bit 
      .format('wav')                  // Formato WAV explícito
      .on('start', (commandLine) => {
        console.log('FFmpeg proceso iniciado: ' + commandLine);
      })
      .on('progress', (progress) => {
        console.log('Progreso de FFmpeg: ' + progress.percent + '% completado');
      })
      .on('end', () => {
        console.log(`FFmpeg: Conversión a WAV completa: ${outputFile}`);
        
        // Verificar que el archivo generado es un WAV válido
        try {
          const header = fs.readFileSync(outputFile, { start: 0, end: 11 });
          
          // Verificar encabezado RIFF
          if (header.toString('ascii', 0, 4) !== 'RIFF' || 
              header.toString('ascii', 8, 12) !== 'WAVE') {
            console.error('Archivo WAV generado no tiene un encabezado RIFF/WAVE válido');
            return reject(new Error('El archivo generado no es un WAV válido'));
          }
          
          console.log('Archivo WAV verificado correctamente');
          resolve(outputFile);
        } catch (err) {
          reject(new Error(`Error al verificar archivo WAV: ${err.message}`));
        }
      })
      .on('error', (err) => {
        console.error("Error en la conversión de audio con FFmpeg:", err);
        reject(new Error(`Error en la conversión de audio: ${err.message}`));
      })
      .run();
  });
}

// Función para procesar el audio con Azure Speech
async function processAudioWithAzure(wavBuffer, res) {
  try {
    // Verificar que tenemos datos
    if (!wavBuffer || wavBuffer.length === 0) {
      console.error("Audio buffer vacío");
      return res.status(400).json({ error: "Empty audio buffer" });
    }
    
    console.log(`Tamaño del buffer de audio (WAV): ${wavBuffer.length} bytes`);
    
    // Verificar encabezado WAV antes de enviar a Azure
    if (wavBuffer.length < 44) { // El encabezado WAV mínimo es de 44 bytes
      console.error("El archivo WAV es demasiado pequeño");
      return res.status(400).json({ error: "WAV file too small" });
    }
    
    const riffHeader = wavBuffer.slice(0, 4).toString('ascii');
    const waveHeader = wavBuffer.slice(8, 12).toString('ascii');
    
    if (riffHeader !== 'RIFF' || waveHeader !== 'WAVE') {
      console.error(`Encabezado WAV inválido: RIFF="${riffHeader}", WAVE="${waveHeader}"`);
      return res.status(400).json({ error: "Invalid WAV header" });
    }
    
    // Configurar Speech SDK con credenciales
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    
    // Configurar para español
    speechConfig.speechRecognitionLanguage = "es-ES";
    
    // Crear un AudioConfig directamente desde el buffer WAV
    console.log("Creando AudioConfig desde WAV...");
    const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(wavBuffer);
    
    // Crear el reconocedor
    console.log("Iniciando reconocimiento de voz con Azure Speech...");
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    
    // Realizar el reconocimiento
    return new Promise((resolve) => {
      recognizer.recognizeOnceAsync(
        result => {
          console.log("Resultado de Azure Speech:", result.reason);
          
          if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
            console.log("Transcripción exitosa:", result.text);
            return resolve(res.status(200).json({ text: result.text || "Sin texto reconocible" }));
          } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
            console.log("No se detectó voz en el audio");
            return resolve(res.status(200).json({ text: "No se detectó voz en el audio. Por favor, habla más fuerte o acércate al micrófono." }));
          } else {
            const errorMsg = `Error en reconocimiento: ${result.reason}, detalles: ${result.errorDetails || "No hay detalles adicionales"}`;
            console.error(errorMsg);
            return resolve(res.status(500).json({ error: errorMsg }));
          }
        },
        err => {
          console.error("Error en recognizeOnceAsync:", err);
          return resolve(res.status(500).json({ error: err.message || "Recognition error" }));
        }
      );
    });
  } catch (error) {
    console.error("Error al procesar audio con Azure:", error);
    return res.status(500).json({ error: `Azure Speech error: ${error.message}` });
  }
}