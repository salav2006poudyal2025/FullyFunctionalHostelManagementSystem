// data/rooms.js
// This file acts as our simple "database" for rooms.
// In a real project, you would use a real database like MongoDB or MySQL.

const rooms = [
  { id: 1, roomNumber: "101", type: "2 seater",  price: 20000, status: "Available" },
  { id: 2, roomNumber: "102", type: "3 seater",  price: 15000, status: "Full"      },
  { id: 3, roomNumber: "103", type: "4 seater",  price: 10000, status: "Available" },
  { id: 4, roomNumber: "101", type: "2 seater",   price:20000, status: "Avilable"      },
  { id: 5, roomNumber: "105", type: "3 seater",  price: 15000, status: "Available" },
  { id: 6, roomNumber: "106", type: "4 seater",  price: 10000, status: "Available" },
];

// This array will hold all submitted bookings (stored in memory while server runs)
const bookings = [];

module.exports = { rooms, bookings };
