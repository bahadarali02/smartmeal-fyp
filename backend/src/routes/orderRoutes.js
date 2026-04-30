const express = require("express");

const orderController = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

const createOrder = orderController.createOrder;
const getMyOrders = orderController.getMyOrders;
const getChefOrders = orderController.getChefOrders;

const updateChefOrderStatus =
  orderController.updateChefOrderStatus ||
  orderController.updateOrderStatus ||
  orderController.updateOrderStatusByChef;

if (!createOrder || !getMyOrders || !getChefOrders || !updateChefOrderStatus) {
  console.error("Order route handler missing. Check orderController exports:", {
    createOrder: typeof createOrder,
    getMyOrders: typeof getMyOrders,
    getChefOrders: typeof getChefOrders,
    updateChefOrderStatus: typeof updateChefOrderStatus,
    updateOrderStatus: typeof orderController.updateOrderStatus,
    updateOrderStatusByChef: typeof orderController.updateOrderStatusByChef,
  });
}

/*
  IMPORTANT ROUTE ORDER RULE:

  Specific routes must always come BEFORE dynamic routes.

  Correct:
  /my-orders
  /chef-orders
  /:orderId/status

  If a dynamic route like "/:orderId" is placed before "/my-orders",
  Express may treat "my-orders" as an orderId and cause 404 or wrong behavior.
*/

/*
  Customer routes
*/
router.post("/", protect, authorizeRoles("customer"), createOrder);

router.get("/my-orders", protect, authorizeRoles("customer"), getMyOrders);

/*
  Chef routes
*/
router.get("/chef-orders", protect, authorizeRoles("chef"), getChefOrders);

router.put(
  "/:orderId/status",
  protect,
  authorizeRoles("chef"),
  updateChefOrderStatus
);

module.exports = router;