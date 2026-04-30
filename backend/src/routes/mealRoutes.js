const express = require("express");
const {
  createMeal,
  getAllMeals,
  getMealById,
  getChefMeals,
  updateMeal,
  deleteMeal,
} = require("../controllers/mealController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/*
  IMPORTANT:
  Specific routes must come BEFORE dynamic routes like "/:mealId".

  If "/:mealId" comes first, Express will treat "chef" as mealId
  when frontend calls:
  /api/meals/chef/my-meals
*/

/* Public customer marketplace routes */
router.get("/", getAllMeals);

/* Chef-only routes */
router.get("/chef/my-meals", protect, authorizeRoles("chef"), getChefMeals);
router.post("/", protect, authorizeRoles("chef"), createMeal);

/* Dynamic meal routes */
router.get("/:mealId", getMealById);
router.put("/:mealId", protect, authorizeRoles("chef"), updateMeal);
router.delete("/:mealId", protect, authorizeRoles("chef"), deleteMeal);

module.exports = router;