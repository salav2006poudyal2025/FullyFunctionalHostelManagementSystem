const mongoose = require("mongoose");

const ownerSettingsSchema = new mongoose.Schema({

  paymentQrUrl: {
    type: String,
    default: ""
  }

});

module.exports = mongoose.model(
  "OwnerSettings",
  ownerSettingsSchema
);