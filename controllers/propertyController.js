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
    console.log("👉 Query Params from Frontend:", req.query);

    let filter = {};

    // Filter based on type
    if (req.query.type) {
      switch (req.query.type) {
        case "sellSold":
          filter.rentOrSale = "Sale";
          filter.status = "Sold";
          break;
        case "rentSold":
          filter.rentOrSale = "Rent";
          filter.status = "Sold";
          break;
        case "saleAvailable":  // ✅ Sale Available
          filter.rentOrSale = "Sale";
          filter.status = "Available";
          break;
        case "rentAvailable":  // ✅ Rent Available
          filter.rentOrSale = "Rent";
          filter.status = "Available";
          break;
        // Add more cases if needed
      }
    }

    // Other filters
    if (req.query.bhk) filter.bhk = req.query.bhk;

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.ownership) {
      filter.hpOrFreehold = new RegExp(req.query.ownership, "i"); // Case insensitive
    }

    if (req.query.searchText) {
      const searchRegex = new RegExp(req.query.searchText, "i");
      filter.$or = [
        { title: searchRegex },
        { houseNo: searchRegex },
        { block: searchRegex },
        { pocket: searchRegex },
        { reference: searchRegex },
      ];
    }

    console.log("🔍 Filter Object:", filter);

    const properties = await Property.find(filter);

    console.log(`✅ Found ${properties.length} properties`);

    res.json({
      properties,
      count: properties.length,
      filter: req.query,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      message: "Error fetching properties",
      error: error.message,
    });
  }
};






// Additional optimization: Add indexes to your MongoDB collection
// Run these in MongoDB shell or add to your schema:
/*
db.properties.createIndex({ createdAt: -1 })
db.properties.createIndex({ rentOrSale: 1 })
db.properties.createIndex({ location: 1 })
db.properties.createIndex({ price: 1 })
db.properties.createIndex({ bhk: 1 })
db.properties.createIndex({ 
  title: "text", 
  location: "text", 
  description: "text" 
})
*/

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
