const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Warden = require("../models/Warden");

module.exports = async (
  req,
  res,
  next
) => {

  try {

    // ==========================================
    // GET TOKEN
    // ==========================================

    const authHeader =
      req.headers.authorization;

    // ==========================================
    // CHECK TOKEN
    // ==========================================

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({

        message: "No token provided"
      });
    }

    // ==========================================
    // EXTRACT TOKEN
    // ==========================================

    const token =
      authHeader.split(" ")[1];

    // ==========================================
    // VERIFY TOKEN
    // ==========================================

    const decoded = jwt.verify(

      token,

      process.env.JWT_SECRET
    );

    // ==========================================
    // CHECK ROLE AND VERIFY ACCOUNT EXISTS
    // ==========================================

    if (decoded.role === "Owner") {

      const owner = await User.findById(decoded.id);

      if (!owner) {

        return res.status(401).json({
          accountDeactivated: true,
          message: "Your account has been deactivated"
        });
      }

      req.owner = decoded;

    } else if (decoded.role === "Warden") {

      const warden = await Warden.findById(decoded.id);

      if (!warden) {

        return res.status(401).json({
          accountDeactivated: true,
          message: "Your account has been deactivated"
        });
      }

      if (warden.status !== "Active") {

        return res.status(401).json({
          accountDeactivated: true,
          message: "Your account has been deactivated"
        });
      }

      req.warden = decoded;

    } else {

      return res.status(403).json({

        message: "Access denied"
      });
    }

    next();

  } catch (error) {

    return res.status(401).json({

      message: "Invalid token"
    });
  }
};
