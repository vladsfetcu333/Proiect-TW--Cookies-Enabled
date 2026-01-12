/**
 * Entry point for Bug Tracker API (Express server)
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { authRoutes } = require("./routes/authRoutes");
const { projectRoutes } = require("./routes/projectRoutes");
const { bugRoutes } = require("./routes/bugRoutes");
const { integrationRoutes } = require("./routes/integrationRoutes");


const app = express();

// Global middleware FIRST
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/", bugRoutes);
app.use("/integrations", integrationRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
