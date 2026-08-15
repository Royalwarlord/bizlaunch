const express = require("express");
const pool = require("../db");

const router = express.Router();

// ========================================
// GET SINGLE PUBLIC PRODUCT
// ========================================

router.get(
  "/:businessSlug/products/:productSlug",
  async (req, res) => {
    try {
      const {
        businessSlug,
        productSlug,
      } = req.params;

      const result = await pool.query(
        `
        SELECT
          p.id,
          p.business_id,
          p.name,
          p.slug,
          p.description,
          p.price,
          p.category,
          p.image_url,
          p.is_available,
          p.created_at,

          b.business_name,
          b.slug AS business_slug,
          b.business_type,
          b.phone,
          b.email,
          b.whatsapp,
          b.town,
          b.county,
          b.address,
          b.logo_url

        FROM products p

        INNER JOIN business_profiles b
          ON p.business_id = b.id

        WHERE b.slug = $1
          AND p.slug = $2
          AND p.is_available = true

        LIMIT 1
        `,
        [businessSlug, productSlug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        product: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Public product detail error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to load product",
      });
    }
  }
);

// ========================================
// GET PUBLIC BUSINESS PROFILE BY SLUG
// INCLUDING PRODUCTS
// ========================================

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // ========================================
    // GET BUSINESS
    // ========================================

    const businessResult = await pool.query(
      `
      SELECT
        id,
        business_name,
        slug,
        business_type,
        description,
        phone,
        email,
        county,
        town,
        address,
        whatsapp,
        website,
        facebook,
        instagram,
        logo_url,
        cover_image_url,
        created_at
      FROM business_profiles
      WHERE slug = $1
      LIMIT 1
      `,
      [slug]
    );

    if (businessResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const business = businessResult.rows[0];

    // ========================================
    // GET BUSINESS PRODUCTS
    // ========================================

    const productsResult = await pool.query(
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
      WHERE business_id = $1
        AND is_available = true
      ORDER BY created_at DESC
      `,
      [business.id]
    );

    // ========================================
    // RETURN BUSINESS + PRODUCTS
    // ========================================

    res.status(200).json({
      success: true,

      business: business,

      // IMPORTANT:
      // Products are returned at the top level
      // because PublicBusiness.jsx expects:
      // data.products
      products: productsResult.rows,
    });
  } catch (error) {
    console.error(
      "Public business error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load business",
    });
  }
});

module.exports = router;