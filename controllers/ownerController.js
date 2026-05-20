const multer = require("multer");

const path = require("path");

const OwnerSettings = require(
  "../models/OwnerSettings"
);


// ======================================================
// MULTER STORAGE CONFIG
// ======================================================

const storage = multer.diskStorage({

  destination: function (
    req,
    file,
    cb
  ) {

    cb(null, "uploads/qr/");
  },

  filename: function (
    req,
    file,
    cb
  ) {

    const uniqueName =
      Date.now() +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});


// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg"
  ];

  if (
    allowedTypes.includes(file.mimetype)
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only image files are allowed"
      ),
      false
    );
  }
};


// ======================================================
// MULTER UPLOAD
// ======================================================

exports.uploadQr = multer({

  storage,

  fileFilter

}).single("qr");


// ======================================================
// SAVE QR URL
// ======================================================

exports.saveQrSettings = async (
  req,
  res
) => {

  try {

    // ==========================================
    // CHECK FILE
    // ==========================================

    if (!req.file) {

      return res.status(400).json({

        message: "QR image is required"
      });
    }

    // ==========================================
    // CREATE QR URL
    // ==========================================

    const qrUrl =

      `${req.protocol}://${req.get(
        "host"
      )}/uploads/qr/${req.file.filename}`;

    // ==========================================
    // FIND SETTINGS
    // ==========================================

    let settings =
      await OwnerSettings.findOne();

    // ==========================================
    // CREATE SETTINGS IF NOT EXISTS
    // ==========================================

    if (!settings) {

      settings =
        new OwnerSettings({
          paymentQrUrl: qrUrl
        });

    } else {

      settings.paymentQrUrl = qrUrl;
    }

    await settings.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({

      qrUrl
    });

  } catch (error) {

    res.status(500).json({

      error: error.message
    });
  }
};