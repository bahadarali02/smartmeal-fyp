const express = require("express");
const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createMarketplaceNotification,
} = require("../controllers/notificationController");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.put("/:notificationId/read", protect, markNotificationAsRead);
router.put("/read-all", protect, markAllNotificationsAsRead);

router.post(
  "/marketplace",
  protect,
  authorizeRoles("admin"),
  createMarketplaceNotification
);

module.exports = router;