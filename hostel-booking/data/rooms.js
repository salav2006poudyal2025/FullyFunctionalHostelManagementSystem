// data/rooms.js
// This file acts as our simple "database" for rooms.
// In a real project, you would use a real database like MongoDB or MySQL.

const rooms = [
  { id: 1, roomNumber: "101", seaterType: "2 seater", totalSeats: 2, price: 20000 },
  { id: 2, roomNumber: "102", seaterType: "3 seater", totalSeats: 3, price: 15000 },
  { id: 3, roomNumber: "103", seaterType: "4 seater", totalSeats: 4, price: 10000 },
  { id: 4, roomNumber: "105", seaterType: "2 seater", totalSeats: 2, price: 18000 },
  { id: 5, roomNumber: "106", seaterType: "3 seater", totalSeats: 3, price: 15000 },
  { id: 6, roomNumber: "108", seaterType: "4 seater", totalSeats: 4, price: 22000 },
  { id: 7, roomNumber: "112", seaterType: "2 seater", totalSeats: 2, price: 16000 },
];

// This array will hold all submitted bookings (stored in memory while server runs)
const bookings = [];

module.exports = { rooms, bookings };
