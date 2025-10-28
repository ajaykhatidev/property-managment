const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); 
const propertyRoutes = require("./routes/propertyRoutes");
const clientRoutes = require("./routes/clientRoutes");
const cors = require("cors");
const KeepAliveService = require("./services/keepalive");

dotenv.config();

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON requests


app.get("/", (req, res) => {
  res.send("API is running...");
});

// Keepalive endpoint for render.com
app.get("/keepalive", (req, res) => {
  console.log(`🏃 Keepalive ping received at ${new Date().toISOString()}`);
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: "Server is running smoothly!"
  });
});

// Keepalive service status endpoint
app.get("/keepalive/status", (req, res) => {
  if (global.keepaliveService) {
    res.status(200).json({
      service: "keepalive",
      ...global.keepaliveService.getStatus()
    });
  } else {
    res.status(200).json({
      service: "keepalive",
      status: "disabled",
      reason: "Running in development mode or service not initialized"
    });
  }
});

app.use("/api/properties", propertyRoutes);
app.use("/api/clients", clientRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Initialize keepalive service for Render.com
  if (process.env.NODE_ENV === 'production') {
    const serverUrl = process.env.RENDER_EXTERNAL_URL || `https://your-app-name.onrender.com`;
    console.log(`🔄 Initializing keepalive service for: ${serverUrl}`);
    
    // Wait a bit before starting keepalive to ensure server is fully ready
    setTimeout(() => {
      const keepalive = new KeepAliveService(serverUrl, 13 * 60 * 1000); // Ping every 13 minutes
      keepalive.start();
      
      // Store reference for potential cleanup
      global.keepaliveService = keepalive;
    }, 30000); // Wait 30 seconds before starting
  } else {
    console.log(`🏠 Running in development mode - keepalive service disabled`);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  if (global.keepaliveService) {
    global.keepaliveService.stop();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  if (global.keepaliveService) {
    global.keepaliveService.stop();
  }
  process.exit(0);
});
