const express = require("express");
const pool = require("../db");

const router = express.Router();

// ========================================
// XML ESCAPE HELPER
// ========================================

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ========================================
// SITEMAP
// ========================================

router.get("/", async (req, res) => {
  try {
    const siteUrl =
      process.env.FRONTEND_URL ||
      process.env.VITE_SITE_URL ||
      "http://localhost:5173";

    // ========================================
    // GET BUSINESS PROFILES
    // ========================================

    const businessesResult = await pool.query(`
      SELECT
        id,
        slug,
        updated_at
      FROM business_profiles
      WHERE slug IS NOT NULL
      ORDER BY id DESC
    `);

    // ========================================
    // GET PRODUCTS
    // ========================================

    const productsResult = await pool.query(`
      SELECT
        p.id,
        p.slug,
        p.updated_at,
        bp.slug AS business_slug
      FROM products p
      INNER JOIN business_profiles bp
        ON bp.id = p.business_id
      WHERE p.slug IS NOT NULL
        AND bp.slug IS NOT NULL
      ORDER BY p.id DESC
    `);

    // ========================================
    // STATIC URLS
    // ========================================

    const urls = [
      {
        loc: `${siteUrl}/`,
        priority: "1.0",
        changefreq: "weekly",
      },
      {
        loc: `${siteUrl}/register`,
        priority: "0.8",
        changefreq: "monthly",
      },
      {
        loc: `${siteUrl}/login`,
        priority: "0.5",
        changefreq: "monthly",
      },
    ];

    // ========================================
    // BUSINESS URLS
    // ========================================

    for (const business of businessesResult.rows) {
      urls.push({
        loc: `${siteUrl}/business/${business.slug}`,
        lastmod: business.updated_at,
        priority: "0.9",
        changefreq: "weekly",
      });
    }

    // ========================================
    // PRODUCT URLS
    // ========================================

    for (const product of productsResult.rows) {
      urls.push({
        loc: `${siteUrl}/business/${product.business_slug}/product/${product.slug}`,
        lastmod: product.updated_at,
        priority: "0.8",
        changefreq: "weekly",
      });
    }

    // ========================================
    // BUILD XML
    // ========================================

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;

    xml += `
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>`;

    for (const url of urls) {
      xml += `
  <url>
    <loc>${escapeXml(url.loc)}</loc>`;

      if (url.lastmod) {
        xml += `
    <lastmod>${new Date(
      url.lastmod
    ).toISOString()}</lastmod>`;
      }

      if (url.changefreq) {
        xml += `
    <changefreq>${url.changefreq}</changefreq>`;
      }

      if (url.priority) {
        xml += `
    <priority>${url.priority}</priority>`;
      }

      xml += `
  </url>`;
    }

    xml += `
</urlset>`;

    // ========================================
    // RESPONSE
    // ========================================

    res.set("Content-Type", "application/xml");

    res.status(200).send(xml);
  } catch (error) {
    console.error(
      "Sitemap generation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to generate sitemap",
    });
  }
});

module.exports = router;