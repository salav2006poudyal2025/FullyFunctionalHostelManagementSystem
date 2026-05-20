exports.getRoomsForWarden = async (req, res) => {
  try {
    const rooms = await Room.find().populate("students"); // if students are referenced

    const formattedRooms = rooms.map(room => ({
      _id: room._id,
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      occupied: room.students ? room.students.length : 0,
      available: room.capacity - (room.students ? room.students.length : 0)
    }));

    res.status(200).json(formattedRooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};