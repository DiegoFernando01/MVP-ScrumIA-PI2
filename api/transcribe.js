import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import os from "os";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegPath.path);

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 20 * 1024 * 1024,
  multiples: false,
  maxFields: 1,
  filename: (name, ext) => `audio_${Date.now()}${ext}`
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Only POST allowed" });
  }
  try {
    const { audioBuffer, audioType, tempFilePath } = await new Promise((resolve, reject) => {
      const form = formidable(formidableConfig);
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        const audioFile = files.audio?.[0];
        if (!audioFile) return reject(new Error("No se recibió archivo de audio"));
        try {
          const data = fs.readFileSync(audioFile.filepath);
          resolve({
            audioBuffer: data,
            audioType: fields.audioType?.[0] || audioFile.mimetype,
            tempFilePath: audioFile.filepath
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    const wavPath = await convertToWav(tempFilePath, audioType);
    const wavBuffer = fs.readFileSync(wavPath);

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage = "es-ES";
    const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(wavBuffer);
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    return new Promise(resolve => {
      recognizer.recognizeOnceAsync(result => {
        if (result.errorDetails) {
          res.status(500).json({ error: result.errorDetails });
        } else {
          res.status(200).json({ text: result.text });
        }
        // limpieza de temporales
        try {
          fs.unlinkSync(wavPath);
          fs.unlinkSync(tempFilePath);
        } catch {}
        resolve();
      });
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function convertToWav(inputPath, audioType) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`El archivo de entrada no existe: ${inputPath}`);
  }

  const outputPath = path.join(os.tmpdir(), `output_${Date.now()}.wav`);
  await new Promise((res, rej) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .noVideo()
      .audioChannels(1)
      .audioFrequency(16000)
      .audioCodec("pcm_s16le")
      .format("wav")
      .on("end", () => res())
      .on("error", e => rej(e))
      .run();
  });
  return outputPath;
}