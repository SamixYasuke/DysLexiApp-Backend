import path from "path";
import OpenAI from "openai";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_API_KEY,
});

const audioFolderPath = path.join(__dirname, "../audios");
if (!fs.existsSync(audioFolderPath)) {
  fs.mkdirSync(audioFolderPath);
}

const getWordPronounciation = async (word) => {
  try {
    const speechFile = path.join(audioFolderPath, `pronounced_${word}.mp3`);
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: word,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    return speechFile;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

export default getWordPronounciation;
