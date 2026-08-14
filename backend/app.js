const publicBusinessRoutes = require("./api/publicBusiness");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const authRoutes = require("./api/auth");
const businessRoutes = require("./api/business");
const uploadRoutes = require("./api/upload");
const productsRoutes = require("./api/products");
const enquiriesRoutes = require("./api/enquiries");
const dashboardRoutes = require("./api/dashboard");
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
// AUTHENTICATION ROUTES
// ========================================

app.use("/api/auth", authRoutes);

// ========================================
// BUSINESS ROUTES
// ========================================

app.use("/api/business", businessRoutes);
app.use("/api/public/business", publicBusinessRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/enquiries", enquiriesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ========================================
// SEO
// ========================================

app.use("/sitemap.xml", sitemapRoutes);
app.use("/robots.txt", robotsRoutes);
// ========================================
// SEO SITEMAP
// ========================================

app.use(
  "/",
  sitemapRoutes
);

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