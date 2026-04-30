const { Follow, User, Meal } = require("../models");

const getMyFollowing = async (req, res) => {
  try {
    const following = await Follow.findAll({
      where: {
        customerId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "chef",
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "profileImageUrl",
            "specialty",
            "serviceArea",
            "approvalStatus",
          ],
          include: [
            {
              model: Meal,
              as: "meals",
              where: {
                availability: true,
                moderationStatus: "approved",
              },
              required: false,
              attributes: [
                "id",
                "name",
                "description",
                "price",
                "imageUrl",
                "imageAspectRatio",
                "availability",
                "moderationStatus",
                "createdAt",
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Following list fetched successfully.",
      count: following.length,
      following,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch following list.",
      error: error.message,
    });
  }
};

const followChef = async (req, res) => {
  try {
    const { chefId } = req.params;

    if (Number(chefId) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself.",
      });
    }

    const chef = await User.findOne({
      where: {
        id: chefId,
        role: "chef",
        approvalStatus: "approved",
      },
    });

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: "Chef not found or not approved.",
      });
    }

    const existingFollow = await Follow.findOne({
      where: {
        customerId: req.user.id,
        chefId,
      },
    });

    if (existingFollow) {
      return res.status(200).json({
        success: true,
        message: "You are already following this chef.",
        follow: existingFollow,
      });
    }

    const follow = await Follow.create({
      customerId: req.user.id,
      chefId,
    });

    return res.status(201).json({
      success: true,
      message: "Chef followed successfully.",
      follow,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to follow chef.",
      error: error.message,
    });
  }
};

const unfollowChef = async (req, res) => {
  try {
    const { chefId } = req.params;

    const follow = await Follow.findOne({
      where: {
        customerId: req.user.id,
        chefId,
      },
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "Follow record not found.",
      });
    }

    await follow.destroy();

    return res.status(200).json({
      success: true,
      message: "Chef unfollowed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to unfollow chef.",
      error: error.message,
    });
  }
};

module.exports = {
  getMyFollowing,
  followChef,
  unfollowChef,
};