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
    const {
      page = 1,
      limit = 20,
      search,
      rentOrSale,
      status,       // ✅ status query param
      minPrice,
      maxPrice,
      location,
      bhk
    } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (rentOrSale) filter.rentOrSale = rentOrSale;
    if (status) filter.status = status; // ✅ Added status filter
    if (location) filter.location = { $regex: location, $options: "i" };
    if (bhk) filter.bhk = bhk;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination info
    const totalProperties = await Property.countDocuments(filter);

    // Fetch properties with pagination and filters
    const properties = await Property.find(filter)
      .select(
        "title price location images createdAt rentOrSale status description houseNo block pocket reference bhk hpOrFreehold floor phoneNumber"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalProperties / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    res.status(200).json({
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProperties,
        hasNext,
        hasPrev,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
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
