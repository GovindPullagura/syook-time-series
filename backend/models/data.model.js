const mongoose = require("mongoose");

const dataSchema = mongoose.Schema(
  {
    name: String,
    origin: String,
    destination: String,
    secret_key: String,
    timestamp: Date,
  },
  { versionKey: false }
);

const DataModel = mongoose.model("object", dataSchema);

module.exports = { DataModel };
