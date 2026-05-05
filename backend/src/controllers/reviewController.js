const { Review, Meal, User } = require("../models");

const createReview = async (req, res) => {
  try {
    const { mealId } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    const existing = await Review.findOne({
      where: {
        mealId,
        customerId: req.user.id,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this meal.",
      });
    }

    const review = await Review.create({
      mealId,
      customerId: req.user.id,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully.",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create review.",
      error: error.message,
    });
  }
};

const getMealReviews = async (req, res) => {
  try {
    const { mealId } = req.params;

    const reviews = await Review.findAll({
      where: { mealId },
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "profileImageUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const averageRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) /
            reviews.length
          ).toFixed(1)
        : 0;

    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating,
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

module.exports = {
  createReview,
  getMealReviews,
};