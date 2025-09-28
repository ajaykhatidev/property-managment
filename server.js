const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); 
const propertyRoutes = require("./routes/propertyRoutes");
const clientRoutes = require("./routes/clientRoutes");
const cors = require("cors");

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


app.use("/api/properties", propertyRoutes);
app.use("/api/clients", clientRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
