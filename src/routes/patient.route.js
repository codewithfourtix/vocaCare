const express = require('express');
const router = express.Router();
const Patient = require('../models/patient.model');

// Get all patients
router.get('/', async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

// Get a patient by contact number
router.get('/:contactNumber', async (req, res) => {
  const patient = await Patient.findOne({ contactNumber: req.params.contactNumber });
  if (!patient) return res.status(404).json({ error: 'Not found' });
  res.json(patient);
});

// Create a new patient
router.post('/', async (req, res) => {
  const { name, contactNumber } = req.body;
  const patient = new Patient({ name, contactNumber });
  await patient.save();
  res.status(201).json(patient);
});

module.exports = router;
