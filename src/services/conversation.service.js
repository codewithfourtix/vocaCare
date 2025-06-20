const Patient = require('../models/patient.model');
const CallSession = require('../models/callSession.model');
const openaiService = require('./openai.services');
const elevenlabs = require('./elevanlab.service');

const questions = [
  'What is your name?',
  'Which doctor would you like to see?',
  'What date and time do you want for your appointment?',
  'What is your contact number?'
];
const fieldNames = ['name', 'doctorName', 'appointmentDateTime', 'contactNumber'];

exports.processRecording = async (recordingUrl, callSid, from) => {
  console.log('Processing recording for CallSid:', callSid, 'From:', from, 'Recording URL:', recordingUrl);
  let session = await CallSession.findOne({ contactNumber: from });
  if (!session) {
      session = await CallSession.create({ contactNumber: from });
  }
  const transcription = await openaiService.transcribeAudio(recordingUrl);
  console.log('Transcription received:', transcription);
  const extractedInfo = await openaiService.extractInfoFromText(transcription, session.context);
  console.log('Extracted info:', extractedInfo);
  const currentField = fieldNames[session.step];
  if (extractedInfo[currentField]) {
    session.data[currentField] = extractedInfo[currentField];
    session.step++;
    session.retries = 0;
  } else {
    session.retries++;
  }
  await session.save();
  if (session.step >= questions.length) {
    // Save to DB
    let patient = await Patient.findOne({ contactNumber: session.data.contactNumber });
    if (!patient) {
      patient = new Patient({
        name: session.data.name,
        contactNumber: session.data.contactNumber,
        appointments: []
      });
    }
    patient.appointments.push({
      doctorName: session.data.doctorName,
      appointmentDateTime: session.data.appointmentDateTime
    });
    await patient.save();
    await CallSession.deleteOne({ contactNumber: from });
    return { nextPrompt: '', done: true, goodbye: 'Thank you. Your appointment is booked. Goodbye.' };
  }
  if (session.retries > 1) {
    await CallSession.deleteOne({ contactNumber: from });
    return { nextPrompt: '', done: false, goodbye: 'Sorry, I could not understand. Please call again later. Goodbye.' };
  }
  return { nextPrompt: questions[session.step], done: false };
};
