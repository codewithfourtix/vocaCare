const express = require('express');
const router = express.Router();
const twilioService = require('../services/twilio.service');

// Twilio webhook for incoming calls
router.post('/voice', twilioService.handleIncomingCall);
// Twilio webhook for handling recording
router.post('/handle-recording', twilioService.handleRecording);

module.exports = router;
