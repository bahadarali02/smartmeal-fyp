const express = require("express");
const {
  getMyFavorites,
  addFavorite,
  removeFavorite,
} = require("../controllers/favoriteController");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorizeRoles("customer"), getMyFavorites);
router.post("/:mealId", protect, authorizeRoles("customer"), addFavorite);
router.delete("/:mealId", protect, authorizeRoles("customer"), removeFavorite);

module.exports = router;