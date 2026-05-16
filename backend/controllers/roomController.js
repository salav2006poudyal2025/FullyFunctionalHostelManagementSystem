const Room = require("../models/Room");

// GET /api/rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, seaterType, monthlyFee } = req.body;

    if (!roomNumber || !seaterType || !monthlyFee) {
      return res.status(400).json({ message: "Room number, seater type and monthly fee are required" });
    }

    const exists = await Room.findOne({ roomNumber: String(roomNumber) });
    if (exists) return res.status(400).json({ message: "Room number already exists" });

    const room = await Room.create({
      roomNumber: String(roomNumber),
      seaterType: Number(seaterType),
      totalSeats: Number(seaterType),
      monthlyFee: Number(monthlyFee),
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/rooms/:id
exports.updateRoom = async (req, res) => {
  try {
    const { monthlyFee } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (monthlyFee !== undefined) room.monthlyFee = Number(monthlyFee);
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.occupiedSeats > 0) {
      return res.status(400).json({ message: "Cannot delete a room with occupied seats" });
    }
    await room.deleteOne();
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
