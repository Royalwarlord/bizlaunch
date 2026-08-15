const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ========================================
// GET DASHBOARD STATISTICS
// ========================================

router.get("/stats", authenticateToken, async (req, res) => {
  try {
    // Find the logged-in user's business
    const businessResult = await pool.query(
      `
      SELECT id
      FROM business_profiles
      WHERE user_id = $1
      LIMIT 1
      `,
      [req.user.userId]
    );

    if (businessResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found.",
      });
    }

    const businessId = businessResult.rows[0].id;

    // ========================================
    // PRODUCT STATISTICS
    // ========================================

    const productsResult = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total_products,
        COUNT(*) FILTER (
          WHERE is_available = true
        )::int AS available_products
      FROM products
      WHERE business_id = $1
      `,
      [businessId]
    );

    // ========================================
    // ENQUIRY STATISTICS
    // ========================================

    const enquiriesResult = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total_enquiries,
        COUNT(*) FILTER (
          WHERE status = 'new'
        )::int AS new_enquiries,
        COUNT(*) FILTER (
          WHERE status = 'contacted'
        )::int AS contacted_enquiries,
        COUNT(*) FILTER (
          WHERE status = 'closed'
        )::int AS closed_enquiries
      FROM enquiries
      WHERE business_id = $1
      `,
      [businessId]
    );

    const products = productsResult.rows[0];
    const enquiries = enquiriesResult.rows[0];

    res.status(200).json({
      success: true,
      stats: {
        totalProducts: products.total_products,
        availableProducts: products.available_products,

        totalEnquiries: enquiries.total_enquiries,
        newEnquiries: enquiries.new_enquiries,
        contactedEnquiries: enquiries.contacted_enquiries,
        closedEnquiries: enquiries.closed_enquiries,
      },
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics.",
    });
  }
});

// ========================================
// GET DASHBOARD ANALYTICS
// ========================================

router.get("/analytics", authenticateToken, async (req, res) => {
  try {
    // ========================================
    // FIND LOGGED-IN USER'S BUSINESS
    // ========================================

    const businessResult = await pool.query(
      `
      SELECT id
      FROM business_profiles
      WHERE user_id = $1
      LIMIT 1
      `,
      [req.user.userId]
    );

    if (businessResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found.",
      });
    }

    const businessId = businessResult.rows[0].id;

    // ========================================
    // PRODUCT ANALYTICS
    // ========================================

    const productsResult = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total_products,

        COUNT(*) FILTER (
          WHERE is_available = true
        )::int AS available_products,

        COUNT(*) FILTER (
          WHERE is_available = false
        )::int AS unavailable_products

      FROM products
      WHERE business_id = $1
      `,
      [businessId]
    );

    // ========================================
    // ENQUIRY ANALYTICS
    // ========================================

    const enquiriesResult = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total_enquiries,

        COUNT(*) FILTER (
          WHERE status = 'new'
        )::int AS new_enquiries,

        COUNT(*) FILTER (
          WHERE status = 'contacted'
        )::int AS contacted_enquiries,

        COUNT(*) FILTER (
          WHERE status = 'closed'
        )::int AS closed_enquiries

      FROM enquiries
      WHERE business_id = $1
      `,
      [businessId]
    );

    // ========================================
    // MONTHLY ENQUIRIES
    // ========================================

    const monthlyEnquiriesResult = await pool.query(
      `
      SELECT
        TO_CHAR(
          DATE_TRUNC('month', created_at),
          'Mon YYYY'
        ) AS month,

        COUNT(*)::int AS enquiries

      FROM enquiries

      WHERE business_id = $1

      GROUP BY DATE_TRUNC('month', created_at)

      ORDER BY DATE_TRUNC('month', created_at) ASC

      LIMIT 12
      `,
      [businessId]
    );

    // ========================================
    // RECENT ENQUIRIES
    // ========================================

    const recentEnquiriesResult = await pool.query(
      `
      SELECT
        id,
        customer_name,
        customer_phone,
        customer_email,
        message,
        status,
        created_at

      FROM enquiries

      WHERE business_id = $1

      ORDER BY created_at DESC

      LIMIT 10
      `,
      [businessId]
    );

    // ========================================
    // PRODUCT LIST
    // ========================================

    const productsListResult = await pool.query(
      `
      SELECT
        id,
        name,
        price,
        is_available

      FROM products

      WHERE business_id = $1

      ORDER BY name ASC
      `,
      [businessId]
    );

    const products = productsResult.rows[0];
    const enquiries = enquiriesResult.rows[0];

    // ========================================
    // SEND ANALYTICS
    // ========================================

    res.status(200).json({
      success: true,

      analytics: {
        // Product statistics
        totalProducts: products.total_products,
        availableProducts: products.available_products,
        unavailableProducts: products.unavailable_products,

        // Enquiry statistics
        totalEnquiries: enquiries.total_enquiries,
        newEnquiries: enquiries.new_enquiries,
        contactedEnquiries: enquiries.contacted_enquiries,
        closedEnquiries: enquiries.closed_enquiries,

        // Additional analytics
        monthlyEnquiries: monthlyEnquiriesResult.rows,

        recentEnquiries: recentEnquiriesResult.rows,

        productsList: productsListResult.rows,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard analytics.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router;