const express = require("express");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ========================================
// CREATE PRODUCT SLUG
// ========================================

function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ========================================
// GET CURRENT BUSINESS
// ========================================

async function getBusiness(userId) {
  const result = await pool.query(
    `
    SELECT id
    FROM business_profiles
    WHERE user_id = $1
    LIMIT 1
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

// ========================================
// PUBLIC PRODUCTS
// ========================================
// Anyone can access these.
// These are intentionally products from ALL businesses.

router.get("/public", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        business_id,
        name,
        slug,
        description,
        price,
        category,
        image_url,
        is_available,
        created_at
      FROM products
      WHERE is_available = true
      ORDER BY created_at DESC
      `
    );

    res.status(200).json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error("Get public products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve products",
    });
  }
});

// ========================================
// PUBLIC PRODUCTS
// ========================================
// Keep this route public for your public
// products page.

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        business_id,
        name,
        slug,
        description,
        price,
        category,
        image_url,
        is_available,
        created_at,
        updated_at
      FROM products
      WHERE is_available = true
      ORDER BY created_at DESC
      `
    );

    res.status(200).json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve products",
    });
  }
});

// ========================================
// GET MY PRODUCTS
// ========================================
// IMPORTANT:
// This route returns ONLY products belonging
// to the logged-in user's business.

router.get(
  "/mine",
  authenticateToken,
  async (req, res) => {
    try {
      const business = await getBusiness(
        req.user.userId
      );

      if (!business) {
        return res.status(404).json({
          success: false,
          message: "Business profile not found",
          products: [],
        });
      }

      const result = await pool.query(
        `
        SELECT
          id,
          business_id,
          name,
          slug,
          description,
          price,
          category,
          image_url,
          is_available,
          created_at,
          updated_at
        FROM products
        WHERE business_id = $1
        ORDER BY created_at DESC
        `,
        [business.id]
      );

      res.status(200).json({
        success: true,
        products: result.rows,
      });
    } catch (error) {
      console.error(
        "Get my products error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to retrieve your products",
        products: [],
      });
    }
  }
);

// ========================================
// CREATE PRODUCT
// ========================================

router.post(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        imageUrl,
        isAvailable,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name is required",
        });
      }

      const business = await getBusiness(
        req.user.userId
      );

      if (!business) {
        return res.status(404).json({
          success: false,
          message: "Business profile not found",
        });
      }

      const slug = createSlug(name);

      const result = await pool.query(
        `
        INSERT INTO products (
          business_id,
          name,
          slug,
          description,
          price,
          category,
          image_url,
          is_available
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
          business.id,
          name.trim(),
          slug,
          description || null,
          price === "" ||
          price === undefined
            ? null
            : Number(price),
          category || null,
          imageUrl || null,
          isAvailable !== false,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to create product",
      });
    }
  }
);

// ========================================
// UPDATE PRODUCT
// ========================================

router.put(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const productId = Number(
        req.params.id
      );

      if (!Number.isInteger(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const {
        name,
        description,
        price,
        category,
        imageUrl,
        isAvailable,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name is required",
        });
      }

      const business = await getBusiness(
        req.user.userId
      );

      if (!business) {
        return res.status(404).json({
          success: false,
          message: "Business profile not found",
        });
      }

      const slug = createSlug(name);

      const result = await pool.query(
        `
        UPDATE products
        SET
          name = $1,
          slug = $2,
          description = $3,
          price = $4,
          category = $5,
          image_url = $6,
          is_available = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
          AND business_id = $9
        RETURNING *
        `,
        [
          name.trim(),
          slug,
          description || null,
          price === "" ||
          price === undefined
            ? null
            : Number(price),
          category || null,
          imageUrl || null,
          isAvailable !== false,
          productId,
          business.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found or does not belong to your business",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to update product",
      });
    }
  }
);

// ========================================
// DELETE PRODUCT
// ========================================

router.delete(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const productId = Number(
        req.params.id
      );

      if (!Number.isInteger(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const business = await getBusiness(
        req.user.userId
      );

      if (!business) {
        return res.status(404).json({
          success: false,
          message: "Business profile not found",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM products
        WHERE id = $1
          AND business_id = $2
        RETURNING id
        `,
        [
          productId,
          business.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found or does not belong to your business",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to delete product",
      });
    }
  }
);

module.exports = router;