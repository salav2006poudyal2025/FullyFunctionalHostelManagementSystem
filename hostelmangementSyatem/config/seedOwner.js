const User = require("../models/User.");

const seedOwner = async () => {
  const existing = await User.findOne({ email: "owner@gmail.com" });

  if (!existing) {
    await User.create({
      email: "owner@gmail.com",
      password: "owner12345",
      role: "owner"
    });
    console.log("Owner created");
  } else {
    console.log("Owner already exists");
  }
};

module.exports = seedOwner;