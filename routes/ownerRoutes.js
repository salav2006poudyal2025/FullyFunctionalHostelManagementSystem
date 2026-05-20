const express = require("express");

const router = express.Router();

const {

  uploadQr,

  saveQrSettings

} = require(
  "../controllers/ownerController"
);

const ownerMiddleware = require(
  "../middleware/ownerMiddleware"
);


// ======================================================
// OWNER QR SETTINGS ROUTE
// ======================================================

router.post(

  "/settings/qr",

  ownerMiddleware,

  uploadQr,

  saveQrSettings
);


module.exports = router;