const Client = require("../models/Client");

// Create a new client
const createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: client,
    });
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create client",
      error: error.message,
    });
  }
};

// Get all clients with filtering and search
const getAllClients = async (req, res) => {
  try {
    const { search, requirement, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Search functionality
    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    
    // Filter by requirement
    if (requirement) {
      filter.requirement = requirement;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get clients with pagination
    const clients = await Client.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const totalClients = await Client.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalClients / parseInt(limit)),
        totalClients,
        hasNext: skip + clients.length < totalClients,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
      error: error.message,
    });
  }
};

// Get single client by ID
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).lean();
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client",
      error: error.message,
    });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      data: client,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update client",
      error: error.message,
    });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id).lean();
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
      data: client,
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: error.message,
    });
  }
};

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
};
