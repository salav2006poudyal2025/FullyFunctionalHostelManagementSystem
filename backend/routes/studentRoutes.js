const router = require("express").Router();
const {
  register,
  login,
  getMe,
  tokenPayment,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
} = require("../controllers/studentAuthController");
const { protectStudent } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protectStudent, getMe);
router.post("/khalti/initiate", protectStudent, initiateKhaltiPayment);
router.post("/khalti/verify", protectStudent, verifyKhaltiPayment);
router.post("/token-payment", protectStudent, tokenPayment);

module.exports = router;
