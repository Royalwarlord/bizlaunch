const express = require("express");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ========================================
// CREATE BUSINESS SLUG
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
// GET BUSINESS PROFILE
// ========================================

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        user_id,
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
        created_at,
        updated_at
      FROM business_profiles
      WHERE user_id = $1
      `,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        profile: null,
      });
    }

    res.status(200).json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Get business profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve business profile",
    });
  }
});

// ========================================
// CREATE BUSINESS PROFILE
// ========================================

router.post("/profile", authenticateToken, async (req, res) => {
  try {
    const {
      businessName,
      businessType,
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
      logoUrl,
      coverImageUrl,
    } = req.body;

    // ----------------------------------------
    // VALIDATE BUSINESS NAME
    // ----------------------------------------

    if (!businessName || !businessName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business name is required",
      });
    }

    // ----------------------------------------
    // CREATE SLUG
    // ----------------------------------------

    const slug = createSlug(businessName);

    // ----------------------------------------
    // CHECK EXISTING PROFILE
    // ----------------------------------------

    const existingProfile = await pool.query(
      `
      SELECT id
      FROM business_profiles
      WHERE user_id = $1
      `,
      [req.user.userId]
    );

    if (existingProfile.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Business profile already exists",
      });
    }

    // ----------------------------------------
    // INSERT PROFILE
    // ----------------------------------------

    const result = await pool.query(
      `
      INSERT INTO business_profiles (
        user_id,
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
        cover_image_url
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16
      )
      RETURNING *
      `,
      [
        req.user.userId,
        businessName.trim(),
        slug,
        businessType || null,
        description || null,
        phone || null,
        email || null,
        county || null,
        town || null,
        address || null,
        whatsapp || null,
        website || null,
        facebook || null,
        instagram || null,
        logoUrl || null,
        coverImageUrl || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Business profile created successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Create business profile error:", error);

    // Handle duplicate slug
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A business with this name already exists. Please choose another name.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to create business profile",
    });
  }
});

// ========================================
// UPDATE BUSINESS PROFILE
// ========================================

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const {
      businessName,
      businessType,
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
      logoUrl,
      coverImageUrl,
    } = req.body;

    // ----------------------------------------
    // VALIDATE BUSINESS NAME
    // ----------------------------------------

    if (!businessName || !businessName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business name is required",
      });
    }

    // ----------------------------------------
    // CREATE UPDATED SLUG
    // ----------------------------------------

    const slug = createSlug(businessName);

    // ----------------------------------------
    // UPDATE PROFILE
    // ----------------------------------------

    const result = await pool.query(
      `
      UPDATE business_profiles
      SET
        business_name = $1,
        slug = $2,
        business_type = $3,
        description = $4,
        phone = $5,
        email = $6,
        county = $7,
        town = $8,
        address = $9,
        whatsapp = $10,
        website = $11,
        facebook = $12,
        instagram = $13,
        logo_url = $14,
        cover_image_url = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $16
      RETURNING *
      `,
      [
        businessName.trim(),
        slug,
        businessType || null,
        description || null,
        phone || null,
        email || null,
        county || null,
        town || null,
        address || null,
        whatsapp || null,
        website || null,
        facebook || null,
        instagram || null,
        logoUrl || null,
        coverImageUrl || null,
        req.user.userId,
      ]
    );

    // ----------------------------------------
    // PROFILE NOT FOUND
    // ----------------------------------------

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    // ----------------------------------------
    // SUCCESS
    // ----------------------------------------

    res.status(200).json({
      success: true,
      message: "Business profile updated successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Update business profile error:", error);

    // Handle duplicate slug
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A business with this name already exists. Please choose another name.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to update business profile",
    });
  }
});

module.exports = router;