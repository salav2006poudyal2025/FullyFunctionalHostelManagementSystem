const express = require("express");
const router = express.Router();

const {
  addWarden,
  getWardens,
  updateWarden,
  deleteWarden
} = require("../controllers/wardenController");

const ownerMiddleware = require(
  "../middleware/ownerMiddleware"
);

// CRUD (protected with ownerMiddleware)
router.post("/", ownerMiddleware, addWarden);
router.get("/", ownerMiddleware, getWardens);
router.put("/:id", ownerMiddleware, updateWarden);
router.delete("/:id", ownerMiddleware, deleteWarden);

module.exports = router;