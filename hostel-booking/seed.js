// seed.js
// Script to seed the database with initial data

const mongoose = require('mongoose');
const { Room, Booking } = require('./data/rooms');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/hostel-booking');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Room.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data');

    // Seed rooms
    const rooms = [
      { roomNumber: "101", seaterType: 2, totalSeats: 2, price: 20000 },
      { roomNumber: "102", seaterType: 3, totalSeats: 3, price: 15000 },
      { roomNumber: "103", seaterType: 4, totalSeats: 4, price: 10000 },
      { roomNumber: "105", seaterType: 2, totalSeats: 2, price: 18000 },
      { roomNumber: "106", seaterType: 3, totalSeats: 3, price: 15000 },
      { roomNumber: "108", seaterType: 4, totalSeats: 4, price: 22000 },
      { roomNumber: "112", seaterType: 2, totalSeats: 2, price: 16000 },
    ];

    for (const roomData of rooms) {
      const room = new Room({
        ...roomData,
        occupiedSeats: 0,
        seatsLeft: roomData.totalSeats,
        status: "Available",
      });
      await room.save();
    }
    console.log('Seeded rooms');

    // Seed bookings
    const bookings = [
      {
        fullName: "Ram Sharma",
        email: "ram@example.com",
        phone: "9800000000",
        roomNumber: "101",
        checkIn: "2026-04-15",
        status: "Pending",
      },
      {
        fullName: "Sita Devi",
        email: "sita@example.com",
        phone: "9800000001",
        roomNumber: "102",
        checkIn: "2026-04-16",
        status: "Pending",
      },
      {
        fullName: "Hari Prasad",
        email: "hari@example.com",
        phone: "9800000002",
        roomNumber: "101",
        checkIn: "2026-04-17",
        status: "Approved",
        paymentStatus: "Pending",
        actionedBy: "warden",
        actionedAt: new Date("2026-04-01T12:00:00.000Z"),
      },
      {
        fullName: "Sulav Poudyal",
        email: "sulav@example.com",
        phone: "9800000003",
        roomNumber: "102",
        checkIn: "2026-04-18",
        status: "Approved",
        paymentStatus: "Complete",
        actionedBy: "warden",
        actionedAt: new Date("2026-04-02T14:00:00.000Z"),
      },
      {
        fullName: "Anita Thapa",
        email: "anita@example.com",
        phone: "9800000004",
        roomNumber: "103",
        checkIn: "2026-04-19",
        status: "Approved",
        paymentStatus: "Pending",
        actionedBy: "warden",
        actionedAt: new Date("2026-04-03T11:00:00.000Z"),
      },
      {
        fullName: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "9800000005",
        roomNumber: "105",
        checkIn: "2026-04-20",
        status: "Approved",
        paymentStatus: "Complete",
        actionedBy: "warden",
        actionedAt: new Date("2026-04-04T10:00:00.000Z"),
      },
    ];

    for (const bookingData of bookings) {
      const booking = new Booking(bookingData);
      await booking.save();
    }
    console.log('Seeded bookings');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();