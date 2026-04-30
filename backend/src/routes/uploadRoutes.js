const express = require("express");
const { uploadSingleImage } = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/single", protect, (req, res) => {
  uploadSingleImage(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Image upload failed.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully.",
      imageUrl: `/uploads/${req.file.filename}`,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  });
});

module.exports = router;