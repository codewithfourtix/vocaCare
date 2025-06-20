const mongoose = require('mongoose');

const callSessionSchema = new mongoose.Schema({
  contactNumber: { type: String, required: true },
  step: { type: Number, default: 0 },
  data: { type: Object, default: {} },
  retries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CallSession', callSessionSchema);
