const User = require("../models/User");

const seedOwner = async () => {
  try {
    const existingOwner = await User.findOne({
      email: "owner@gmail.com"
    });

    if (!existingOwner) {
      await User.create({
        fullName: "System Owner",
        email: "owner@gmail.com",
        password: "owner12345",
        role: "Owner"
      });

      console.log(" Owner created");
    } else {
      console.log("Owner already exists");
    }

  } catch (error) {
    console.log(error.message);
  }
};

module.exports = seedOwner;