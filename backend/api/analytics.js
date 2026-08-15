const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ========================================
// GET BUSINESS ANALYTICS
// ========================================

router.get("/", authenticateToken, async (req, res) => {
  try {
    // ========================================
    // FIND CURRENT BUSINESS
    // ========================================

    const businessResult = await pool.query(
      `
      SELECT id, business_name
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

    const business = businessResult.rows[0];
    const businessId = business.id;

    // ========================================
    // PRODUCT STATISTICS
    // ========================================

    const productResult = await pool.query(
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
    // ENQUIRY STATISTICS
    // ========================================

    const enquiryResult = await pool.query(
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
    // RECENT ENQUIRIES
    // ========================================

    const recentEnquiriesResult = await pool.query(
      `
      SELECT
        e.id,
        e.customer_name,
        e.status,
        e.created_at,
        p.name AS product_name

      FROM enquiries e

      LEFT JOIN products p
        ON e.product_id = p.id

      WHERE e.business_id = $1

      ORDER BY e.created_at DESC

      LIMIT 10
      `,
      [businessId]
    );

    // ========================================
    // ENQUIRIES BY DAY
    // ========================================

    const enquiryChartResult = await pool.query(
      `
      SELECT
        TO_CHAR(
          created_at,
          'YYYY-MM-DD'
        ) AS date,

        COUNT(*)::int AS enquiries

      FROM enquiries

      WHERE business_id = $1

      AND created_at >= CURRENT_DATE - INTERVAL '30 days'

      GROUP BY
        TO_CHAR(created_at, 'YYYY-MM-DD')

      ORDER BY date ASC
      `,
      [businessId]
    );

    // ========================================
    // TOP PRODUCTS
    // ========================================

    const topProductsResult = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.image_url,
        COUNT(e.id)::int AS enquiry_count

      FROM products p

      LEFT JOIN enquiries e
        ON e.product_id = p.id

      WHERE p.business_id = $1

      GROUP BY
        p.id,
        p.name,
        p.image_url

      ORDER BY enquiry_count DESC

      LIMIT 5
      `,
      [businessId]
    );

    // ========================================
    // RESPONSE
    // ========================================

    res.status(200).json({
      success: true,

      business: {
        id: business.id,
        name: business.business_name,
      },

      products: productResult.rows[0],

      enquiries: enquiryResult.rows[0],

      enquiryChart: enquiryChartResult.rows,

      recentEnquiries:
        recentEnquiriesResult.rows,

      topProducts:
        topProductsResult.rows,
    });
  } catch (error) {
    console.error(
      "Analytics error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load analytics.",
    });
  }
});

module.exports = router;