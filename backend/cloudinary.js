const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

// ========================================
// CLOUDINARY CONFIGURATION
// ========================================

if (process.env.CLOUDINARY_URL) {
  // Use the complete Cloudinary connection URL
  cloudinary.config({
    secure: true,
  });
} else {
  // Fallback to separate Cloudinary variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// ========================================
// EXPORT
// ========================================

module.exports = cloudinary;