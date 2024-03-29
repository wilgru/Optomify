const { Schema, model } = require('mongoose');

const patientSchema = new Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  mobile_number: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  has_medicare: {
    type: Boolean,
    required: true
  },
  medicare_number: {
    type: String,
    required: function() { return this.has_medicare }
  },
  medicare_ref: {
    type: String,
    required: function() { return this.has_medicare }
  },
  medicare_exp: {
    type: Date,
    required: function() { return this.has_medicare }
  },
  bookings: [{
    type: Schema.Types.ObjectId, 
    ref: 'Booking'
  }],
  clinical_files: [{
    type: Schema.Types.ObjectId, 
    ref: 'ClinicalFile'
  }],
  notes: [{
    type: Schema.Types.ObjectId, 
    ref: 'Note'
  }],
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
  
const Patient = model('Patient', patientSchema);

module.exports = Patient;