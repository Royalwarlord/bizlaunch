const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  const siteUrl =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  res.type("text/plain");
  res.send(robots);
});

module.exports = router;