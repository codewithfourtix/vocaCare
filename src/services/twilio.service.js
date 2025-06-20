const twilio = require("twilio");
const conversationService = require("./conversation.service");
const elevenlabService = require("./elevanlab.service");
const path = require("path");

exports.handleIncomingCall = async (req, res) => {
  console.log("Incoming call request body:", req.body);
  const twiml = new twilio.twiml.VoiceResponse();
  const welcomeAudioPath = await elevenlabService.generateVoiceResponse(
    "Welcome to VocaCare. Please tell me your name after the beep.",
    "welcome.mp3"
  );
  if (welcomeAudioPath) {
    twiml.play(welcomeAudioPath);
  } else {
    twiml.say("Welcome to VocaCare. Please tell me your name after the beep.");
  }
  twiml.record({
    action: "/calls/handle-recording",
    maxLength: 30,
    transcribe: false,
  });
  res.type("text/xml");
  res.send(twiml.toString());
};

exports.handleRecording = async (req, res) => {
  console.log("Recording webhook request body:", req.body);
  const recordingUrl = req.body.RecordingUrl;
  console.log("Recording URL received:", recordingUrl);
  const caller = req.body.From;
  const twiml = new twilio.twiml.VoiceResponse();
  try {
    const { nextPrompt, done, goodbye } =
      await conversationService.processRecording(
        recordingUrl,
        req.body.CallSid,
        req.body.From
      );
    console.log("Response from conversation service:", {
      nextPrompt,
      done,
      goodbye,
    });
    if (goodbye) {
      const goodbyeAudioPath = await elevenlabService.generateVoiceResponse(
        goodbye,
        "goodbye.mp3"
      );
      if (goodbyeAudioPath) {
        twiml.play(goodbyeAudioPath);
      } else {
        twiml.say(goodbye);
      }
      twiml.hangup();
    } else {
      const nextPromptAudioPath = await elevenlabService.generateVoiceResponse(
        nextPrompt,
        "next_prompt.mp3"
      );
      if (nextPromptAudioPath) {
        twiml.play(nextPromptAudioPath);
      } else {
        twiml.say(nextPrompt);
      }
      twiml.record({
        action: "/calls/handle-recording",
        maxLength: 30,
        transcribe: false,
      });
    }
  } catch (err) {
    console.error("Error in handleRecording:", err);
    twiml.say("Sorry, there was an error. Goodbye.");
    twiml.hangup();
  }
  res.type("text/xml");
  res.send(twiml.toString());
};
