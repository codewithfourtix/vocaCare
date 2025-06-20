const express = require('express');
const router = express.Router();

router.use('/patients', require('./patient.route'));
router.use('/calls', require('./call.route'));

module.exports = router;
