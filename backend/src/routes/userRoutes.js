const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);
router.put("/password", protect, updateMyPassword);

module.exports = router;