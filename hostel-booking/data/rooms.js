// data/rooms.js
// MongoDB models for rooms and bookings

const mongoose = require('mongoose');

// Room Schema
const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  seaterType: {
    type: Number,
    required: true,
    enum: [2, 3, 4]
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 2,
    max: 4
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  occupiedSeats: {
    type: Number,
    default: 0,
    min: 0
  },
  seatsLeft: {
    type: Number,
    default: function() {
      return this.totalSeats;
    },
    min: 0
  },
  status: {
    type: String,
    default: 'Available',
    enum: ['Available', 'Full']
  }
}, {
  timestamps: true
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true
  },
  checkIn: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Complete'],
    default: 'Pending'
  },
  actionedBy: {
    type: String,
    enum: ['warden', 'owner']
  },
  actionedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create models
const Room = mongoose.model('Room', roomSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Export models
module.exports = { Room, Booking };
