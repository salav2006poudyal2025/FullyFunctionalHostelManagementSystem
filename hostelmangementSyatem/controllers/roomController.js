const Room = require("../models/Room");

exports.getRooms = async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
};