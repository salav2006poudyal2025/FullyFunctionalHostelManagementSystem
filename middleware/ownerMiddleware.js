const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    // CHECK ROLE
    // ==========================================

    if (decoded.role !== "Owner") {

      return res.status(403).json({

        message: "Access denied"
      });
    }

    // ==========================================
    // VERIFY OWNER ACCOUNT STILL EXISTS
    // ==========================================

    const owner = await User.findById(decoded.id);

    if (!owner) {

      return res.status(401).json({
        accountDeactivated: true,
        message: "Your account has been deactivated"
      });
    }

    // ==========================================
    // SAVE OWNER DATA
    // ==========================================

    req.owner = decoded;

    next();

  } catch (error) {

    return res.status(401).json({

      message: "Invalid token"
    });
  }
};