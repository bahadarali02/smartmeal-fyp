const {
  User,
  Meal,
  Order,
  OrderItem,
  Notification,
  Follow,
  Review,
} = require("../models");

const {
  sendChefApprovedEmail,
  sendChefRejectedEmail,
  sendMealApprovedEmail,
  sendMealRejectedEmail,
  sendMealRemovedEmail,
} = require("../utils/emailService");

const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalMeals = await Meal.count();
    const totalOrders = await Order.count();

    const pendingChefs = await User.count({
      where: {
        role: "chef",
        approvalStatus: "pending",
      },
    });

    const pendingMeals = await Meal.count({
      where: {
        moderationStatus: "pending",
      },
    });

    const approvedMeals = await Meal.count({
      where: {
        moderationStatus: "approved",
      },
    });

    const rejectedMeals = await Meal.count({
      where: {
        moderationStatus: "rejected",
      },
    });

    const recentUsers = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "phone",
        "address",
        "profileImageUrl",
        "cnicImageUrl",
        "specialty",
        "serviceArea",
        "approvalStatus",
        "rejectionReason",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    const recentOrders = await Order.findAll({
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
              attributes: ["id", "name", "price", "chefId", "imageUrl"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    return res.status(200).json({
      success: true,
      message: "Admin dashboard data fetched successfully.",
      stats: {
        totalUsers,
        totalMeals,
        totalOrders,
        pendingChefs,
        pendingMeals,
        approvedMeals,
        rejectedMeals,
      },
      recentUsers,
      recentOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard data.",
      error: error.message,
    });
  }
};

const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "phone",
        "address",
        "profileImageUrl",
        "cnicImageUrl",
        "specialty",
        "serviceArea",
        "approvalStatus",
        "rejectionReason",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

const updateChefApprovalStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { approvalStatus, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Approval status must be approved or rejected.",
      });
    }

    if (approvalStatus === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting a chef.",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role !== "chef") {
      return res.status(400).json({
        success: false,
        message: "Only chef accounts can be approved or rejected.",
      });
    }

    user.approvalStatus = approvalStatus;
    user.rejectionReason =
      approvalStatus === "rejected" ? rejectionReason.trim() : null;

    await user.save();

    await Notification.create({
      userId: user.id,
      title:
        approvalStatus === "approved"
          ? "Chef profile approved"
          : "Chef profile rejected",
      message:
        approvalStatus === "approved"
          ? "Your chef profile has been approved. You can now manage meals and orders."
          : `Your chef profile was rejected. Reason: ${rejectionReason.trim()}`,
      type: "marketplace_update",
      isRead: false,
    });

    if (approvalStatus === "approved") {
      await sendChefApprovedEmail(user);
    }

    if (approvalStatus === "rejected") {
      await sendChefRejectedEmail(user, rejectionReason.trim());
    }

    return res.status(200).json({
      success: true,
      message:
        approvalStatus === "approved"
          ? "Chef approved successfully."
          : "Chef rejected successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update chef approval status.",
      error: error.message,
    });
  }
};

const getAllMealsForAdmin = async (req, res) => {
  try {
    const meals = await Meal.findAll({
      include: [
        {
          model: User,
          as: "chef",
          attributes: [
            "id",
            "name",
            "email",
            "profileImageUrl",
            "approvalStatus",
            "specialty",
            "serviceArea",
          ],
        },
      ],
      order: [
        ["moderationStatus", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    const counts = {
      pending: meals.filter((meal) => meal.moderationStatus === "pending")
        .length,
      approved: meals.filter((meal) => meal.moderationStatus === "approved")
        .length,
      rejected: meals.filter((meal) => meal.moderationStatus === "rejected")
        .length,
    };

    return res.status(200).json({
      success: true,
      message: "Meals fetched successfully.",
      count: meals.length,
      counts,
      meals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch meals.",
      error: error.message,
    });
  }
};

const updateMealModerationStatus = async (req, res) => {
  try {
    const { mealId } = req.params;
    const { moderationStatus, moderationNote } = req.body;

    if (!["approved", "rejected"].includes(moderationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Moderation status must be approved or rejected.",
      });
    }

    if (moderationStatus === "rejected" && !moderationNote) {
      return res.status(400).json({
        success: false,
        message: "Moderation note is required when rejecting a meal.",
      });
    }

    const meal = await Meal.findByPk(mealId, {
      include: [
        {
          model: User,
          as: "chef",
          attributes: ["id", "name", "email", "approvalStatus"],
        },
      ],
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found.",
      });
    }

    if (
      moderationStatus === "approved" &&
      meal.chef?.approvalStatus !== "approved"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This meal cannot be approved until the chef account is approved.",
      });
    }

    const previousStatus = meal.moderationStatus;

    meal.moderationStatus = moderationStatus;
    meal.moderationNote =
      moderationStatus === "rejected" ? moderationNote.trim() : null;

    if (moderationStatus === "approved") {
      meal.availability = true;
    }

    if (moderationStatus === "rejected") {
      meal.availability = false;
    }

    await meal.save();

    await Notification.create({
      userId: meal.chefId,
      title:
        moderationStatus === "approved" ? "Meal approved" : "Meal rejected",
      message:
        moderationStatus === "approved"
          ? `${meal.name} has been approved and is now visible to customers.`
          : `${meal.name} was rejected. Reason: ${moderationNote.trim()}`,
      type: "marketplace_update",
      isRead: false,
    });

    if (moderationStatus === "approved") {
      await sendMealApprovedEmail(meal.chef, meal);
    }

    if (moderationStatus === "rejected") {
      await sendMealRejectedEmail(meal.chef, meal, moderationNote.trim());
    }

    if (moderationStatus === "approved" && previousStatus !== "approved") {
      const followers = await Follow.findAll({
        where: {
          chefId: meal.chefId,
        },
      });

      const followerNotifications = followers.map((follow) => ({
        userId: follow.customerId,
        title: "New meal from followed chef",
        message: `${meal.chef?.name || "A chef you follow"} added a new meal: ${
          meal.name
        }.`,
        type: "new_meal",
        isRead: false,
      }));

      if (followerNotifications.length > 0) {
        await Notification.bulkCreate(followerNotifications);
      }
    }

    return res.status(200).json({
      success: true,
      message:
        moderationStatus === "approved"
          ? "Meal approved successfully."
          : "Meal rejected successfully.",
      meal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update meal moderation status.",
      error: error.message,
    });
  }
};

const deleteMealAsAdmin = async (req, res) => {
  try {
    const { mealId } = req.params;

    const meal = await Meal.findByPk(mealId, {
      include: [
        {
          model: User,
          as: "chef",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found.",
      });
    }

    await Notification.create({
      userId: meal.chefId,
      title: "Meal removed",
      message: `${meal.name} was removed by admin because it did not meet marketplace standards.`,
      type: "marketplace_update",
      isRead: false,
    });

    await sendMealRemovedEmail(meal.chef, meal);

    await meal.destroy();

    return res.status(200).json({
      success: true,
      message: "Meal removed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove meal.",
      error: error.message,
    });
  }
};

const getAllOrdersForAdmin = async (req, res) => {
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
          include: [
            {
              model: Meal,
              as: "meal",
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
      message: "Orders fetched successfully.",
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
      error: error.message,
    });
  }
};

const getAllReviewsForAdmin = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: Meal,
          as: "meal",
          attributes: ["id", "name", "price", "imageUrl", "chefId"],
          include: [
            {
              model: User,
              as: "chef",
              attributes: ["id", "name", "email", "phone", "profileImageUrl"],
            },
          ],
        },
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone", "profileImageUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const stats = {
      totalReviews: reviews.length,
      fiveStarReviews: reviews.filter((review) => Number(review.rating) === 5)
        .length,
      lowRatingReviews: reviews.filter((review) => Number(review.rating) <= 2)
        .length,
      averageRating:
        reviews.length > 0
          ? Number(
              (
                reviews.reduce((sum, review) => {
                  return sum + Number(review.rating || 0);
                }, 0) / reviews.length
              ).toFixed(1)
            )
          : 0,
    };

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully.",
      count: reviews.length,
      stats,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
      error: error.message,
    });
  }
};

const deleteReviewAsAdmin = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId, {
      include: [
        {
          model: Meal,
          as: "meal",
          attributes: ["id", "name", "chefId"],
        },
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    await Notification.create({
      userId: review.customerId,
      title: "Review removed",
      message: `Your review for ${
        review.meal?.name || "a meal"
      } was removed by admin because it did not meet marketplace standards.`,
      type: "marketplace_update",
      isRead: false,
    });

    await review.destroy();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete review.",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
  getAllUsersForAdmin,
  updateChefApprovalStatus,
  getAllMealsForAdmin,
  updateMealModerationStatus,
  deleteMealAsAdmin,
  getAllOrdersForAdmin,
  getAllReviewsForAdmin,
  deleteReviewAsAdmin,
};