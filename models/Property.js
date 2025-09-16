const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    houseNo: {
      type: String,
      required: true,
    },
    block: {
      type: String,
    },
    pocket: {
      type: String,
    },
    floor: {
      type: String,
    },
    bhk: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    rentOrSale: {
      type: String,
      enum: ["Rent", "Sale"],
      required: true,
    },
    hpOrFreehold: {
      type: String,
      enum: ["HP", "Freehold"],
      required: true,
    },
    reference: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v); // ✅ 10 digit phone number validation
        },
        message: (props) => `${props.value} is not a valid 10-digit phone number!`,
      },
    },
    status: {
      type: String,
      enum: ["Available", "Sold"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
