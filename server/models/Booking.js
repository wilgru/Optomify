const { Schema, model } = require('mongoose');
const { validateBookingType, validateBookSettedUp, validate30MinBlock } = require('../utils/Validators');
const BookSetup = require('./BookSetup');

const bookingSchema = new Schema({
  booking_date: {
    type: Date,
    required: true,
    validate: validateBookSettedUp
  },
  booking_start: {
    type: Date,
    required: true,
    validate: validate30MinBlock
  },
  booking_end: {
    type: Date,
    required: true,
    validate: validate30MinBlock
  },
  patient: {
    type: Schema.Types.ObjectId, 
    ref: 'Patient'
  },
  booking_note: {
    type: String
  },
  booking_type: {
    type: String,
    validate: validateBookingType,
    required: true,
  },
  date_created: {
    type: Date,
    required: true,
    default: Date.now()
  },
  created_by: {
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
  }
});

const Booking = model('Booking', bookingSchema);

module.exports = Booking;