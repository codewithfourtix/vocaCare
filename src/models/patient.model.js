const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: true, unique: true },
  appointments: [
    {
      doctorName: String,
      appointmentDateTime: Date,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Patient', patientSchema);
