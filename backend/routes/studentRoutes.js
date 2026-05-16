const router = require("express").Router();
const { register, login, getMe, updateMe, tokenPayment } = require("../controllers/studentAuthController");
const { protectStudent } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protectStudent, getMe);
router.put("/me", protectStudent, updateMe);
router.post("/token-payment", protectStudent, tokenPayment);

module.exports = router;
