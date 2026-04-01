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
const bookings = [
  {
    id: 1,
    fullName: "Ram Sharma",
    email: "ram@example.com",
    phone: "9800000000",
    roomNumber: "101",
    checkIn: "2026-04-15",
    status: "Pending",
    createdAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: 2,
    fullName: "Sita Devi",
    email: "sita@example.com",
    phone: "9800000001",
    roomNumber: "102",
    checkIn: "2026-04-16",
    status: "Pending",
    createdAt: "2026-04-01T11:00:00.000Z",
  },
  {
    id: 3,
    fullName: "Hari Prasad",
    email: "hari@example.com",
    phone: "9800000002",
    roomNumber: "101",
    checkIn: "2026-04-17",
    status: "Approved",
    createdAt: "2026-04-01T09:00:00.000Z",
    actionedBy: "warden",
    actionedAt: "2026-04-01T12:00:00.000Z",
  },
];

module.exports = { rooms, bookings };
