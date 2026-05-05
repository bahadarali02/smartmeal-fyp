const express = require("express");
const {
  createMeal,
  getAllMeals,
  getMealById,
  getChefMeals,
  updateMeal,
  deleteMeal,
} = require("../controllers/mealController");

const {
  createReview,
  getMealReviews,
} = require("../controllers/reviewController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/* Public */
router.get("/", getAllMeals);

/* Reviews */
router.get("/:mealId/reviews", getMealReviews);
router.post(
  "/:mealId/reviews",
  protect,
  authorizeRoles("customer"),
  createReview
);

/* Chef */
router.get("/chef/my-meals", protect, authorizeRoles("chef"), getChefMeals);
router.post("/", protect, authorizeRoles("chef"), createMeal);

/* Dynamic */
router.get("/:mealId", getMealById);
router.put("/:mealId", protect, authorizeRoles("chef"), updateMeal);
router.delete("/:mealId", protect, authorizeRoles("chef"), deleteMeal);

module.exports = router;