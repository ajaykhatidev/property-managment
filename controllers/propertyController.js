const Property = require("../models/Property");

// =====================
// Create a new property
// =====================
const addProperty = async (req, res) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json({
      message: "Property saved successfully!",
      data: property,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// =====================
// Get all properties
// =====================
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .select('title price location images createdAt') // Sirf zaroori fields
      .sort({ createdAt: -1 }) // Latest first
      .lean(); // MongoDB optimization - 40-50% faster

    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
};

// =====================
// Get single property by ID
// =====================
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// =====================
// Update property by ID
// =====================
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({
      message: "Property updated successfully!",
      data: property,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// =====================
// Delete property by ID
// =====================
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};




// POST	/api/properties	Create property
// GET	/api/properties	  Get all properties
// GET	/api/properties/:id	Get property by ID
// PUT	/api/properties/:id	Update property by ID
// DELETE	/api/properties/:id	Delete property by ID





module.exports = {
  addProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
