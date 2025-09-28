const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    requirement: {
      type: String,
      enum: ["Sale", "Purchase", "Rent", "Lease"],
      required: true,
    },
    budgetMin: {
      type: String,
      trim: true,
    },
    budgetMax: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
