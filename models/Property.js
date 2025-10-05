const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    sector: {
      type: String, // Keep as string so you can handle both numbers and "Other"
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "JANTA",
        "LIG",
        "MIG",
        "HIG",
        "26M",
        "48M",
        "60M",
        "90M",
        "52M",
        "96M",
        "120M",
        "Plot",
        "DDA MARKET",
        "Others",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
      enum: ["House", "Shop"],
      required: true,
    },
    houseNo: {
      type: String,
      required: function() {
        return this.propertyType === "House";
      },
    },
    shopNo: {
      type: String,
      required: function() {
        return this.propertyType === "Shop";
      },
    },
    shopSize: {
      type: String,
      trim: true,
      required: function() {
        return this.propertyType === "Shop";
      },
    },
    block: {
      type: String,
    },
    pocket: {
      type: String,
    },
    floor: {
      type: String,
      enum: ["0", "1", "2", "3", "4", "5", "Kothi", "Plot","Ground Floor"],
    },
    bhk: {
      type: String,
      required: true,
      enum: ["1", "2", "3", "4", "5", "RK", "0"],
    },
    rentOrSale: {
      type: String,
      enum: ["Rent", "Sale", "Lease"],
      required: true,
    },
    hpOrFreehold: {
      type: String,
      enum: ["HP", "Freehold", "Lease"],
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
          return /^[0-9]{10}$/.test(v); // ✅ 10-digit phone number validation
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit phone number!`,
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
