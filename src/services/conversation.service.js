const CallSession = require('../models/callSession.model');
const moment = require('moment');
const openaiService = require('./openai.services');
const Patient = require('../models/patient.model');
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
  patient.appointments.push({
      doctorName: session.data.doctorName,
      appointmentDateTime: (() => {
          const dateStr = session.data.appointmentDateTime;
          if (!dateStr) return null;
          const cleanedDate = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
          const withoutWeekday = cleanedDate.replace(/^\w+,\s*/, ''); // remove weekday
          const finalDateStr = `${withoutWeekday} 2025`;
          const parsedDate = moment(finalDateStr, 'MMMM D [at] h A YYYY').toDate();
          return parsedDate;
      })()
  });
  await patient.save();
  await CallSession.deleteOne({ contactNumber: from });
  return { nextPrompt: '', done: true, goodbye: 'Thank you. Your appointment is booked. Goodbye.' };
} else {
  // Some field missing, ask that question
  await session.save();
  return { nextPrompt: questions[fieldNames.indexOf(missingField)], done: false };
}

  if (!session.data.contactNumber && from) {
    session.data.contactNumber = from; // use caller's phone number if extraction failed
  }
  console.log("Full session data before saving:", session.data);

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
      appointmentDateTime: (() => {
        console.log('Original appointmentDateTime string:', session.data.appointmentDateTime);
        const dateStr = session.data.appointmentDateTime;
        if (!dateStr) return null;
    
        // Remove 'st', 'nd', 'rd', 'th'
        const cleanedDateStr = dateStr.replace(/(\d+)(st|nd|rd|th)/g, '$1');
        console.log('Cleaned appointmentDateTime string:', cleanedDateStr);
    
        // Remove weekday (Monday, Tuesday, etc.)
        const withoutWeekday = cleanedDateStr.replace(/^\w+,\s*/, '');
        console.log('Without weekday string:', withoutWeekday);
    
        // Append year to the date string
        const currentYear = new Date().getFullYear();
        const fullDateStr = `${withoutWeekday} ${currentYear}`;
        console.log('Final date string to parse:', fullDateStr);
    
        // Parse the cleaned string
        const parsedDate = moment(fullDateStr, 'MMMM D [at] h A YYYY', true).toDate();
        console.log('Parsed date object:', parsedDate);
    
        // Return parsed date if valid, else null
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    })()
    
    

    });
    try {
      console.log('Attempting to save patient:', patient);
      await patient.save();
      console.log('Patient saved successfully.');
      await CallSession.deleteOne({ contactNumber: from });
      console.log('CallSession deleted successfully.');
    } catch (error) {
      console.error('Error saving patient or deleting CallSession:', error);
    }
    return { nextPrompt: '', done: true, goodbye: 'Thank you. Your appointment is booked. Goodbye.' };
  }
  if (session.retries > 1) {
    await CallSession.deleteOne({ contactNumber: from });
    return { nextPrompt: '', done: false, goodbye: 'Sorry, I could not understand. Please call again later. Goodbye.' };
  }
  return { nextPrompt: questions[session.step], done: false };
};
