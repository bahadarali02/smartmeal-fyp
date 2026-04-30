const express = require("express");
const {
  getAdminDashboard,
  getAllUsersForAdmin,
  updateChefApprovalStatus,
  getAllMealsForAdmin,
  updateMealModerationStatus,
  deleteMealAsAdmin,
  getAllOrdersForAdmin,
} = require("../controllers/adminController");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("admin"), getAdminDashboard);
router.get("/users", protect, authorizeRoles("admin"), getAllUsersForAdmin);

router.put(
  "/users/:userId/approval",
  protect,
  authorizeRoles("admin"),
  updateChefApprovalStatus
);

router.get("/meals", protect, authorizeRoles("admin"), getAllMealsForAdmin);

router.put(
  "/meals/:mealId/moderation",
  protect,
  authorizeRoles("admin"),
  updateMealModerationStatus
);

router.delete(
  "/meals/:mealId",
  protect,
  authorizeRoles("admin"),
  deleteMealAsAdmin
);

router.get("/orders", protect, authorizeRoles("admin"), getAllOrdersForAdmin);

module.exports = router;