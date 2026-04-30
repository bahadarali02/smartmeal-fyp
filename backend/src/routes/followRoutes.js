const express = require("express");
const {
  getMyFollowing,
  followChef,
  unfollowChef,
} = require("../controllers/followController");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorizeRoles("customer"), getMyFollowing);
router.post("/:chefId", protect, authorizeRoles("customer"), followChef);
router.delete("/:chefId", protect, authorizeRoles("customer"), unfollowChef);

module.exports = router;