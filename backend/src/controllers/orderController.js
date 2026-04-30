const { Order, OrderItem, Meal, User, Notification } = require("../models");

const allowedOrderStatuses = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "delivered",
];

const validStatusFlow = {
  placed: ["accepted"],
  accepted: ["preparing"],
  preparing: ["ready"],
  ready: ["delivered"],
  delivered: [],
};

const safeCreateNotification = async (notificationData) => {
  try {
    await Notification.create(notificationData);
  } catch (error) {
    console.error("Notification create failed:", error.message);
  }
};

const safeBulkCreateNotifications = async (notifications) => {
  try {
    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }
  } catch (error) {
    console.error("Bulk notification create failed:", error.message);
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      items,
      address,
      paymentMethod,
      receiverName,
      receiverPhone,
      city,
      area,
      deliveryNote,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one meal item.",
      });
    }

    if (!receiverName || !receiverName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Receiver name is required.",
      });
    }

    if (!receiverPhone || !receiverPhone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Receiver phone number is required.",
      });
    }

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    if (!area || !area.trim()) {
      return res.status(400).json({
        success: false,
        message: "Area / locality is required.",
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full delivery address is required.",
      });
    }

    const mealIds = items.map((item) => Number(item.mealId)).filter(Boolean);
    const uniqueMealIds = [...new Set(mealIds)];

    if (uniqueMealIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order contains invalid meal items.",
      });
    }

    const meals = await Meal.findAll({
      where: {
        id: uniqueMealIds,
      },
      include: [
        {
          model: User,
          as: "chef",
          attributes: ["id", "name", "serviceArea", "approvalStatus"],
        },
      ],
    });

    if (meals.length !== uniqueMealIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more meals were not found.",
      });
    }

    const unavailableMeal = meals.find(
      (meal) =>
        !meal.availability ||
        meal.moderationStatus !== "approved" ||
        meal.chef?.approvalStatus !== "approved"
    );

    if (unavailableMeal) {
      return res.status(400).json({
        success: false,
        message: `${unavailableMeal.name} is not available for ordering right now.`,
      });
    }

    const order = await Order.create({
      customerId: req.user.id,
      status: "placed",
      paymentMethod: paymentMethod || "Cash on Delivery",
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      city: city.trim(),
      area: area.trim(),
      address: address.trim(),
      deliveryNote: deliveryNote ? deliveryNote.trim() : null,
    });

    const orderItems = items.map((item) => {
      const meal = meals.find(
        (mealItem) => Number(mealItem.id) === Number(item.mealId)
      );

      return {
        orderId: order.id,
        mealId: Number(item.mealId),
        quantity: Math.max(Number(item.quantity || 1), 1),
        priceAtOrder: Number(meal.price),
      };
    });

    await OrderItem.bulkCreate(orderItems);

    const chefIds = [...new Set(meals.map((meal) => meal.chefId))];

    const chefNotifications = chefIds.map((chefId) => ({
      userId: chefId,
      title: "New order received",
      message: `You received a new order for ${area.trim()}, ${city.trim()}.`,
      type: "order_update",
      isRead: false,
    }));

    await safeBulkCreateNotifications(chefNotifications);

    await safeCreateNotification({
      userId: req.user.id,
      title: "Order placed successfully",
      message: `Your order #SM-${order.id} has been placed successfully.`,
      type: "order_update",
      isRead: false,
    });

    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Meal,
              as: "meal",
              attributes: ["id", "name", "price", "imageUrl", "chefId"],
              include: [
                {
                  model: User,
                  as: "chef",
                  attributes: [
                    "id",
                    "name",
                    "email",
                    "phone",
                    "serviceArea",
                    "profileImageUrl",
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: createdOrder,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to place order.",
      error: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        customerId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Meal,
              as: "meal",
              attributes: ["id", "name", "price", "imageUrl", "chefId"],
              include: [
                {
                  model: User,
                  as: "chef",
                  attributes: [
                    "id",
                    "name",
                    "email",
                    "phone",
                    "serviceArea",
                    "profileImageUrl",
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Customer orders fetched successfully.",
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer orders.",
      error: error.message,
    });
  }
};

const getChefOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: OrderItem,
          as: "items",
          required: true,
          include: [
            {
              model: Meal,
              as: "meal",
              where: {
                chefId: req.user.id,
              },
              attributes: ["id", "name", "price", "imageUrl", "chefId"],
              include: [
                {
                  model: User,
                  as: "chef",
                  attributes: ["id", "name", "email", "phone"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Chef orders fetched successfully.",
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET CHEF ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch chef orders.",
      error: error.message,
    });
  }
};

const updateChefOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!allowedOrderStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order status. Use placed, accepted, preparing, ready, or delivered.",
      });
    }

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Meal,
              as: "meal",
              attributes: ["id", "name", "chefId"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const belongsToChef = order.items.some(
      (item) => Number(item.meal?.chefId) === Number(req.user.id)
    );

    if (!belongsToChef) {
      return res.status(403).json({
        success: false,
        message: "You can only update orders containing your meals.",
      });
    }

    if (order.status === status) {
      return res.status(400).json({
        success: false,
        message: `Order is already marked as ${status}.`,
      });
    }

    if (!validStatusFlow[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}. Follow: placed → accepted → preparing → ready → delivered.`,
      });
    }

    order.status = status;
    await order.save();

    await safeCreateNotification({
      userId: order.customerId,
      title: "Order status updated",
      message: `Your order #SM-${order.id} is now ${status}.`,
      type: "order_update",
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("UPDATE CHEF ORDER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getChefOrders,
  updateChefOrderStatus,
  updateOrderStatus: updateChefOrderStatus,
  updateOrderStatusByChef: updateChefOrderStatus,
};