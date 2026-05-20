const jwt = require("jsonwebtoken");

module.exports = async (
  req,
  res,
  next
) => {

  try {

    // ==========================================
    // GET TOKEN FROM HEADER
    // ==========================================

    const authHeader =
      req.headers.authorization;

    // ==========================================
    // CHECK TOKEN EXISTS
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
    // SAVE USER DATA
    // ==========================================

    req.student = decoded;

    next();

  } catch (error) {

    return res.status(401).json({

      message: "Invalid token"
    });
  }
};