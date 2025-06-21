const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  availability: [
    {
      dayOfWeek: { type: String, required: true }, // e.g., 'Monday', 'Tuesday'
      startTime: { type: String, required: true }, // e.g., '09:00'
      endTime: { type: String, required: true }    // e.g., '17:00'
    }
  ]
});

module.exports = mongoose.model('Doctor', doctorSchema);