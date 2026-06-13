const express = require("express");
const router = express.Router();

const {
  addWarden,
  getWardens,
  updateWarden,
  deleteWarden
} = require("../controllers/wardenController");

// CRUD
router.post("/", addWarden);
router.get("/", getWardens);
router.put("/:id", updateWarden);
router.delete("/:id", deleteWarden);

module.exports = router;