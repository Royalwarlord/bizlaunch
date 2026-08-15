process.env.NODE_NO_WARNINGS = "1";

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

// ========================================
// ROUTES
// ========================================

const authRoutes = require("./api/auth");
const businessRoutes = require("./api/business");
const publicBusinessRoutes = require("./api/publicBusiness");
const uploadRoutes = require("./api/upload");
const productsRoutes = require("./api/products");
const enquiriesRoutes = require("./api/enquiries");
const dashboardRoutes = require("./api/dashboard");
const analyticsRoutes = require("./api/analytics");
const sitemapRoutes = require("./api/sitemap");
const robotsRoutes = require("./api/robots");

const app = express();

// ========================================
// CORS
// ========================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ========================================
// JSON BODY PARSER
// ========================================

app.use(express.json());

// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);

app.use("/api/business", businessRoutes);

app.use("/api/public/business", publicBusinessRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/products", productsRoutes);

app.use("/api/enquiries", enquiriesRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/analytics", analyticsRoutes);

// ========================================
// SEO
// ========================================

app.use("/sitemap.xml", sitemapRoutes);

app.use("/robots.txt", robotsRoutes);

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
// SITEMAP ROOT
// ========================================

app.use("/", sitemapRoutes);

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

// ========================================
// ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;