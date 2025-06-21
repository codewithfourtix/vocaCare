require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./src/models/doctor.model');

const doctors = [
  {
    name: 'Dr. Smith',
    availability: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00' }
    ]
  },
  {
    name: 'Dr. Jones',
    availability: [
      { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '18:00' }
    ]
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected for seeding.');

    await Doctor.deleteMany({});
    console.log('Existing doctors removed.');

    await Doctor.insertMany(doctors);
    console.log('Sample doctors added successfully.');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

seedDB();