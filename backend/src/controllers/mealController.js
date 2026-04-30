const { Meal, User } = require("../models");

const createMeal = async (req, res) => {
  try {
    const { name, description, price, availability, imageUrl } = req.body;

    if (!name || !description || !price || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price, and meal photo URL are required.",
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than zero.",
      });
    }

    const newMeal = await Meal.create({
      chefId: req.user.id,
      name,
      description,
      price,
      imageUrl,
      imageAspectRatio: "4:3",
      moderationStatus: "pending",
      moderationNote: null,
      availability: availability === undefined ? true : Boolean(availability),
    });

    return res.status(201).json({
      success: true,
      message:
        "Meal created successfully. It is pending admin review before becoming public.",
      meal: newMeal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create meal.",
      error: error.message,
    });
  }
};

const getAllMeals = async (req, res) => {
  try {
    const meals = await Meal.findAll({
      where: {
        availability: true,
        moderationStatus: "approved",
      },
      include: [
        {
          model: User,
          as: "chef",
          required: true,
          where: {
            approvalStatus: "approved",
          },
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
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Meals fetched successfully.",
      count: meals.length,
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

const getMealById = async (req, res) => {
  try {
    const { mealId } = req.params;

    const meal = await Meal.findOne({
      where: {
        id: mealId,
        availability: true,
        moderationStatus: "approved",
      },
      include: [
        {
          model: User,
          as: "chef",
          required: true,
          where: {
            approvalStatus: "approved",
          },
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
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found or not available.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Meal fetched successfully.",
      meal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch meal.",
      error: error.message,
    });
  }
};

const getChefMeals = async (req, res) => {
  try {
    const meals = await Meal.findAll({
      where: { chefId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Chef meals fetched successfully.",
      count: meals.length,
      meals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chef meals.",
      error: error.message,
    });
  }
};

const updateMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const { name, description, price, availability, imageUrl } = req.body;

    const meal = await Meal.findOne({
      where: {
        id: mealId,
        chefId: req.user.id,
      },
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found or you do not have permission to update it.",
      });
    }

    if (!name || !description || !price || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price, and meal photo URL are required.",
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than zero.",
      });
    }

    meal.name = name;
    meal.description = description;
    meal.price = price;
    meal.imageUrl = imageUrl;
    meal.imageAspectRatio = "4:3";
    meal.availability =
      availability === undefined ? meal.availability : Boolean(availability);

    meal.moderationStatus = "pending";
    meal.moderationNote = null;

    await meal.save();

    return res.status(200).json({
      success: true,
      message:
        "Meal updated successfully. It is pending admin review before becoming public.",
      meal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update meal.",
      error: error.message,
    });
  }
};

const deleteMeal = async (req, res) => {
  try {
    const { mealId } = req.params;

    const meal = await Meal.findOne({
      where: {
        id: mealId,
        chefId: req.user.id,
      },
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found or you do not have permission to delete it.",
      });
    }

    await meal.destroy();

    return res.status(200).json({
      success: true,
      message: "Meal deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete meal.",
      error: error.message,
    });
  }
};

module.exports = {
  createMeal,
  getAllMeals,
  getMealById,
  getChefMeals,
  updateMeal,
  deleteMeal,
};