const FormData = require("form-data");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Whisper STT stub
exports.transcribeAudio = async (recordingUrl) => {
  console.log("Attempting to transcribe audio from URL:", recordingUrl);
  try {
    const response = await axios({
      method: "GET",
      url: `${recordingUrl}`, //fix the .mp3 wali cheez
      responseType: "stream",
    });
    const filePath = path.join(__dirname, "tempRecording.mp3");
    const writer = fs.createWriteStream(filePath);

    // Write the audio stream to a file
    response.data.pipe(writer);
    // Wait until file is fully written
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Prepare form data for Whisper API
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("model", "whisper-1");

    const whisperResponse = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    // Remove the temp file
    fs.unlinkSync(filePath);

    const transcription = whisperResponse.data.text;
    console.log("Audio transcription result:", transcription);
    return transcription;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
};

exports.extractInfoFromText = async (text, context = {}) => {
  console.log("Attempting to extract info from text:", text);
  try {
    const prompt = generatePrompt(text, context);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2, // low temperature for accurate extraction
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const message = response.data.choices[0].message.content.trim();

    // Parse response JSON safely
    let extractedInfo = {};
    try {
      extractedInfo = JSON.parse(message);
      console.log("Extracted information:", extractedInfo);
    } catch (err) {
      console.error("Error parsing GPT response:", err);
    }

    return extractedInfo;
  } catch (error) {
    console.error(
      "Error extracting info with OpenAI:",
      error.response?.data || error.message
    );
    return context; // fallback to existing context if failure
  }
};

// Private helper to generate GPT prompt
const generatePrompt = (text, context) => {
  return `
Extract the following information from this text:

- Name
- Doctor Name
- Appointment Date and Time
- Contact Number

Text:
"""${text}"""

If any field is missing, return null for that field.
Respond strictly in this JSON format:

{
  "name": string | null,
  "doctorName": string | null,
  "appointmentDateTime": string | null,
  "contactNumber": string | null
}
`;
};
