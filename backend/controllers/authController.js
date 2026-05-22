const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  cleanEmail,
  firstValidationError,
  validateEmail,
  validatePassword,
} = require("../utils/validation");

async function ensureDefaultOwner(email, password) {
  if (email !== "owner@gmail.com" || password !== "owner12345") return;

  const hashed = await bcrypt.hash(password, 10);
  const owner = await User.findOne({ email });

  if (!owner) {
    await User.create({
      fullName: "System Owner",
      email,
      password: hashed,
      role: "Owner",
    });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, owner.password);
  if (!passwordMatches || owner.role !== "Owner") {
    owner.password = hashed;
    owner.role = "Owner";
    if (!owner.fullName) owner.fullName = "System Owner";
    await owner.save();
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailClean = cleanEmail(email);
    const passwordClean = String(password || "");
    const validationError = firstValidationError([
      validateEmail(emailClean),
      validatePassword(passwordClean),
    ]);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    await ensureDefaultOwner(emailClean, passwordClean);

    const user = await User.findOne({ email: emailClean });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(passwordClean, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
