const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor.model');

// Get all doctors
router.get('/', async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

// Add a new doctor
router.post('/', async (req, res) => {
  const { name, availability } = req.body;
  const doctor = new Doctor({ name, availability });
  try {
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;