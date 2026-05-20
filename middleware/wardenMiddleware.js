const jwt = require("jsonwebtoken");
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
    // CHECK ROLE
    // ==========================================

    if (decoded.role !== "Warden") {

      return res.status(403).json({

        message: "Access denied"
      });
    }

    // ==========================================
    // VERIFY WARDEN ACCOUNT STILL EXISTS
    // ==========================================

    const warden = await Warden.findById(decoded.id);

    if (!warden) {

      return res.status(401).json({
        accountDeactivated: true,
        message: "Your account has been deactivated"
      });
    }

    // ==========================================
    // CHECK WARDEN STATUS
    // ==========================================

    if (warden.status !== "Active") {

      return res.status(401).json({
        accountDeactivated: true,
        message: "Your account has been deactivated"
      });
    }

    // ==========================================
    // SAVE WARDEN DATA
    // ==========================================

    req.warden = decoded;

    next();

  } catch (error) {

    return res.status(401).json({

      message: "Invalid token"
    });
  }
};
