const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      message: "BizLaunch API and database are working",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ========================================
// ROOT API
// ========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the BizLaunch API",
  });
});

// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    requestedPath: req.path,
  });
});

module.exports = app;