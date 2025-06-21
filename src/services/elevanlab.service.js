const path = require("path");
const axios = require("axios");
const fs = require("fs");

// ElevenLabs TTS stub
exports.generateVoiceResponse = async (
  text,
  filename = "eleven_output.mp3"
) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    const response = await axios({
      method: "POST",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      responseType: "stream",
      data: {
        text: text,
        model_id: "eleven_multilingual_v2", // or 'eleven_monolingual_v1'
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      },
    });

    const outputPath = path.join(__dirname, "../../uploads", filename);
    const writer = fs.createWriteStream(outputPath);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    return `/uploads/${filename}`; // relative path to serve via Express
  } catch (error) {
    console.error(
      "ElevenLabs TTS Error:",
      error.response?.data || error.message
    );
    return null;
  }
};
