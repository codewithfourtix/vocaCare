const CallSession = require('../models/callSession.model');
const moment = require('moment');
const openaiService = require('./openai.services');
const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');
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
  // New smarter logic:
for (const field of fieldNames) {
  if (extractedInfo[field] && !session.data[field]) {
      session.data[field] = extractedInfo[field];
  }
}

// Find the first missing field to ask
const missingField = fieldNames.find(field => !session.data[field]);

if (!missingField) {
  // All info gathered - save to DB
  console.log("All info gathered, proceeding to save.");
  await session.save();
  let patient = await Patient.findOne({ contactNumber: session.data.contactNumber });
  if (!patient) {
      patient = new Patient({
          name: session.data.name,
          contactNumber: session.data.contactNumber,
          appointments: []
      });
  }
  const appointmentDateObj = (() => {
      const dateStr = session.data.appointmentDateTime;
      if (!dateStr) return null;
      const cleanedDate = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
      const withoutWeekday = cleanedDate.replace(/^\w+,\s*/, ''); // remove weekday
      const finalDateStr = `${withoutWeekday} 2025`;
      const parsedDate = moment(finalDateStr, 'MMMM D [at] h A YYYY').toDate();
      return parsedDate;
  })();

  patient.appointments.push({
      doctorName: session.data.doctorName,
      appointmentDateTime: appointmentDateObj
  });

  // Doctor availability check
  const doctor = await Doctor.findOne({ name: session.data.doctorName });
  if (!doctor) {
    console.log(`Doctor ${session.data.doctorName} not found.`);
    await CallSession.deleteOne({ contactNumber: from });
    return { nextPrompt: '', done: false, goodbye: `Sorry, Dr. ${session.data.doctorName} is not available. Please call again later.` };
  }

  const appointmentDay = moment(appointmentDateObj).format('dddd');
  const appointmentTime = moment(appointmentDateObj).format('HH:mm');

  const isAvailable = doctor.availability.some(slot => {
    return slot.dayOfWeek === appointmentDay &&
           appointmentTime >= slot.startTime &&
           appointmentTime <= slot.endTime;
  });

  if (!isAvailable) {
    console.log(`Dr. ${session.data.doctorName} is not available at ${appointmentDay} ${appointmentTime}.`);
    await CallSession.deleteOne({ contactNumber: from });
    return { nextPrompt: '', done: false, goodbye: `Sorry, Dr. ${session.data.doctorName} is not available at that time. Please call again later.` };
  }
  await patient.save();
  await CallSession.deleteOne({ contactNumber: from });
  return { nextPrompt: '', done: true, goodbye: 'Thank you. Your appointment is booked. Goodbye.' };
} else {
  // Some field missing, ask that question
  await session.save();
  return { nextPrompt: questions[fieldNames.indexOf(missingField)], done: false };
}


};
