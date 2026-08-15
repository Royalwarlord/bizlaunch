const express = require("express");
const multer = require("multer");

const cloudinary = require("../cloudinary");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Store uploaded files temporarily in memory.
// We do NOT save them to the Vercel filesystem.
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only JPG, PNG, WEBP and GIF images are allowed."
        )
      );
    }

    cb(null, true);
  },
});

// ========================================
// UPLOAD BUSINESS IMAGE
// ========================================

router.post(
  "/image",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image was uploaded.",
        });
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "bizlaunch/businesses",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(req.file.buffer);
      });

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully.",
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);

      res.status(500).json({
        success: false,
        message: "Image upload failed.",
      });
    }
  }
);

module.exports = router;