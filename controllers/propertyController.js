const Property = require("../models/Property");
const NodeCache = require('node-cache');

// Cache for 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

// Helper function to clear cache
const clearPropertiesCache = () => {
  cache.flushAll();
  console.log("🗑️ Properties cache cleared");
};

// =====================
// Create a new property
// =====================
const addProperty = async (req, res) => {
  try {
    const property = await Property.create(req.body);
    
    // Clear cache after adding new property
    clearPropertiesCache();
    
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
// Get all properties (OPTIMIZED)
// =====================
const getProperties = async (req, res) => {
  try {
    const startTime = Date.now();
    console.log("👉 Query Params from Frontend:", req.query);

    // Create cache key from query parameters
    const cacheKey = JSON.stringify(req.query);
    
    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      const responseTime = Date.now() - startTime;
      console.log(`🚀 Cache HIT - Response time: ${responseTime}ms`);
      return res.json({
        ...cachedResult,
        cached: true,
        responseTime: `${responseTime}ms`
      });
    }

    let filter = {};
    let sortOptions = { createdAt: -1 }; // Default sort by newest

    // Optimized filter building
    if (req.query.type) {
      const typeFilters = {
        sellSold: { rentOrSale: "Sale", status: "Sold" },
        rentSold: { rentOrSale: "Rent", status: "Sold" },
        saleAvailable: { rentOrSale: "Sale", status: "Available" },
        rentAvailable: { rentOrSale: "Rent", status: "Available" }
      };
      
      if (typeFilters[req.query.type]) {
        Object.assign(filter, typeFilters[req.query.type]);
      }
    }

    // Other filters
    if (req.query.bhk) filter.bhk = req.query.bhk;

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Ownership filter (exact match for better performance)
    if (req.query.ownership) {
      filter.hpOrFreehold = req.query.ownership;
    }

    // Search text - optimized
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

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Optimized query with lean() for better performance
    const properties = await Property
      .find(filter)
      .select('sector title description houseNo block pocket floor bhk rentOrSale hpOrFreehold reference price phoneNumber status createdAt updatedAt')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(); // Returns plain JS objects (faster than Mongoose documents)

    const responseTime = Date.now() - startTime;
    console.log(`✅ Found ${properties.length} properties in ${responseTime}ms`);

    const result = {
      properties,
      count: properties.length,
      page,
      limit,
      filter: req.query,
      cached: false,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };

    // Cache the result
    cache.set(cacheKey, result);
    console.log("💾 Result cached for future requests");

    res.json(result);

  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      message: "Error fetching properties",
      error: error.message,
    });
  }
};

// =====================
// Get single property by ID (OPTIMIZED)
// =====================
const getPropertyById = async (req, res) => {
  try {
    const startTime = Date.now();
    const { id } = req.params;
    
    // Check cache first
    const cacheKey = `property_${id}`;
    const cachedProperty = cache.get(cacheKey);
    if (cachedProperty) {
      const responseTime = Date.now() - startTime;
      console.log(`🚀 Property Cache HIT - Response time: ${responseTime}ms`);
      return res.status(200).json({
        ...cachedProperty,
        cached: true,
        responseTime: `${responseTime}ms`
      });
    }

    const property = await Property.findById(id).lean();
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const responseTime = Date.now() - startTime;
    
    // Cache individual property for 10 minutes
    cache.set(cacheKey, property, 600);
    
    res.status(200).json({
      ...property,
      cached: false,
      responseTime: `${responseTime}ms`
    });
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

    // Clear cache after update
    clearPropertiesCache();

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

    // Clear cache after delete
    clearPropertiesCache();

    res.status(200).json({ message: "Property deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// =====================
// Cache Management (Optional - for debugging)
// =====================
const clearCache = async (req, res) => {
  try {
    clearPropertiesCache();
    res.status(200).json({ message: "Cache cleared successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCacheStats = async (req, res) => {
  try {
    const stats = cache.getStats();
    res.status(200).json({
      message: "Cache statistics",
      stats: {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits + stats.misses > 0 ? 
          `${((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)}%` : '0%'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
MongoDB Indexes - Run these commands in MongoDB shell:

db.properties.createIndex({ "rentOrSale": 1, "status": 1, "price": 1 });
db.properties.createIndex({ "bhk": 1 });
db.properties.createIndex({ "hpOrFreehold": 1 });
db.properties.createIndex({ "createdAt": -1 });
db.properties.createIndex({ "sector": 1 });
db.properties.createIndex({
  "title": "text",
  "houseNo": "text", 
  "block": "text",
  "pocket": "text",
  "reference": "text"
});
*/

module.exports = {
  addProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  clearCache,
  getCacheStats
};