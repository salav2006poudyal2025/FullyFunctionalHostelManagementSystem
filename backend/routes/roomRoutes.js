const router = require("express").Router();
const { getRooms, createRoom, updateRoom, deleteRoom } = require("../controllers/roomController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getRooms); // public — needed by landing page and booking form

router.post("/", protect, authorize("Owner"), createRoom);
router.put("/:id", protect, authorize("Owner"), updateRoom);
router.delete("/:id", protect, authorize("Owner"), deleteRoom);

module.exports = router;
