import express from "express";
import getWordPronounciation from "../utilities/getWordPronounciation.js";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.post("/pronounce/:word", async (req, res) => {
  try {
    const { word } = req.params;
    const filePath = await getWordPronounciation(word);
    const base64Audio = await fs.promises.readFile(filePath, {
      encoding: "base64",
    });
    res.sendFile(filePath);
    res.status(200).json({
      message: "Word Pronounced Successfully",
      audio: base64Audio,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while pronouncing the word.",
    });
  }
});

router.get("/get-audio-base64/:word", (req, res) => {
  const audioFolderPath = path.join(__dirname, "../audios");
  try {
    const { word } = req.params;
    const audioFilePath = path.join(audioFolderPath, `pronounced_${word}.mp3`);
    // Check if the audio file exists
    if (!fs.existsSync(audioFilePath)) {
      return res.status(404).json({ message: "Audio file not found." });
    }
    // Read the audio file from the path
    const audioData = fs.readFileSync(audioFilePath);
    // Convert the audio data to Base64
    const base64Audio = audioData.toString("base64");
    // Send the Base64-encoded audio as the response
    res.status(200).json({ base64Audio });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
