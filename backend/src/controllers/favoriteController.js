const { Favorite, Meal, User } = require("../models");

const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: {
        customerId: req.user.id,
      },
      include: [
        {
          model: Meal,
          as: "meal",
          where: {
            availability: true,
            moderationStatus: "approved",
          },
          include: [
            {
              model: User,
              as: "chef",
              attributes: [
                "id",
                "name",
                "email",
                "profileImageUrl",
                "specialty",
                "serviceArea",
                "approvalStatus",
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Favorites fetched successfully.",
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch favorites.",
      error: error.message,
    });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { mealId } = req.params;

    const meal = await Meal.findOne({
      where: {
        id: mealId,
        availability: true,
        moderationStatus: "approved",
      },
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found or not available.",
      });
    }

    const existingFavorite = await Favorite.findOne({
      where: {
        customerId: req.user.id,
        mealId,
      },
    });

    if (existingFavorite) {
      return res.status(200).json({
        success: true,
        message: "Meal is already in favorites.",
        favorite: existingFavorite,
      });
    }

    const favorite = await Favorite.create({
      customerId: req.user.id,
      mealId,
    });

    return res.status(201).json({
      success: true,
      message: "Meal added to favorites.",
      favorite,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add favorite.",
      error: error.message,
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { mealId } = req.params;

    const favorite = await Favorite.findOne({
      where: {
        customerId: req.user.id,
        mealId,
      },
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found.",
      });
    }

    await favorite.destroy();

    return res.status(200).json({
      success: true,
      message: "Meal removed from favorites.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove favorite.",
      error: error.message,
    });
  }
};

module.exports = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
};