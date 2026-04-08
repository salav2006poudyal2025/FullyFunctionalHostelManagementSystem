const User = require("../models/User");

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // OWNER LOGIN (HARDCODE)
    if (
      email === "owner@gmail.com" &&
      password === "owner12345" &&
      role === "owner"
    ) {
      return res.json({
        success: true,
        role: "owner",
        message: "Owner login successful"
      });
    }

    // WARDEN LOGIN (DB)
    const user = await User.findOne({ email, role: "warden" });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.json({
      success: true,
      role: "warden",
      message: "Login successful"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};