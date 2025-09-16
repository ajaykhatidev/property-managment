const express = require("express");
const {
  addProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const router = express.Router();

// Create
router.post("/", addProperty);

// Read
router.get("/", getProperties);
router.get("/:id", getPropertyById);

// Update
router.put("/:id", updateProperty);

// Delete
router.delete("/:id", deleteProperty);

module.exports = router;
