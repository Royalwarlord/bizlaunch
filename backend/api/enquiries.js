const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ========================================
// CUSTOMER SUBMITS ENQUIRY
// ========================================

router.post("/public", async (req, res) => {
  try {
    const {
      businessId,
      productId,
      customerName,
      customerPhone,
      customerEmail,
      message,
    } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "Business is required.",
      });
    }

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Your name is required.",
      });
    }

    if (!customerPhone || !customerPhone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Your phone number is required.",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your message.",
      });
    }

    // ========================================
    // CHECK BUSINESS
    // ========================================

    const businessResult = await pool.query(
      `
      SELECT id
      FROM business_profiles
      WHERE id = $1
      LIMIT 1
      `,
      [businessId]
    );

    if (businessResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business not found.",
      });
    }

    // ========================================
    // CHECK PRODUCT
    // ========================================

    if (productId) {
      const productResult = await pool.query(
        `
        SELECT id
        FROM products
        WHERE id = $1
          AND business_id = $2
        LIMIT 1
        `,
        [productId, businessId]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }
    }

    // ========================================
    // CREATE ENQUIRY
    // ========================================

    const result = await pool.query(
      `
      INSERT INTO enquiries (
        business_id,
        product_id,
        customer_name,
        customer_phone,
        customer_email,
        message
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      RETURNING *
      `,
      [
        businessId,
        productId || null,
        customerName.trim(),
        customerPhone.trim(),
        customerEmail
          ? customerEmail.trim()
          : null,
        message.trim(),
      ]
    );

    res.status(201).json({
      success: true,
      message:
        "Your enquiry has been sent successfully.",
      enquiry: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Create enquiry error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to submit your enquiry.",
    });
  }
});

// ========================================
// GET BUSINESS ENQUIRIES
// ========================================

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      // ========================================
      // GET CURRENT BUSINESS
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
          message:
            "Business profile not found.",
        });
      }

      const businessId =
        businessResult.rows[0].id;

      // ========================================
      // GET ENQUIRIES
      // ========================================

      const result = await pool.query(
        `
        SELECT
          e.id,
          e.business_id,
          e.product_id,
          e.customer_name,
          e.customer_phone,
          e.customer_email,
          e.message,
          e.status,
          e.created_at,
          e.updated_at,

          p.name AS product_name,
          p.image_url AS product_image

        FROM enquiries e

        LEFT JOIN products p
          ON e.product_id = p.id

        WHERE e.business_id = $1

        ORDER BY e.created_at DESC
        `,
        [businessId]
      );

      res.status(200).json({
        success: true,
        enquiries: result.rows,
      });
    } catch (error) {
      console.error(
        "Get enquiries error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to retrieve enquiries.",
      });
    }
  }
);

// ========================================
// UPDATE ENQUIRY STATUS
// ========================================

router.patch(
  "/:id/status",
  authenticateToken,
  async (req, res) => {
    try {
      const enquiryId =
        Number(req.params.id);

      const { status } = req.body;

      const allowedStatuses = [
        "new",
        "contacted",
        "closed",
      ];

      if (!Number.isInteger(enquiryId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid enquiry ID.",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid enquiry status.",
        });
      }

      // ========================================
      // GET BUSINESS
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
          message:
            "Business profile not found.",
        });
      }

      const businessId =
        businessResult.rows[0].id;

      // ========================================
      // UPDATE
      // ========================================

      const result = await pool.query(
        `
        UPDATE enquiries

        SET
          status = $1,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $2
          AND business_id = $3

        RETURNING *
        `,
        [
          status,
          enquiryId,
          businessId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Enquiry not found.",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Enquiry status updated.",
        enquiry: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update enquiry error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to update enquiry.",
      });
    }
  }
);

module.exports = router;