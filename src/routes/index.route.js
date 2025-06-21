const express = require('express');
const router = express.Router();

router.use('/patients', require('./patient.route'));
router.use('/calls', require('./call.route'));
router.use('/doctors', require('./doctor.route'));

module.exports = router;
