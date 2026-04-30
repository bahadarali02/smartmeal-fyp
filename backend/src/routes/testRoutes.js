const express = require("express");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Test route is working.",
  });
});

router.get("/protected", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected route is working.",
    user: req.user,
  });
});

router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin-only route is working.",
    user: req.user,
  });
});

module.exports = router;