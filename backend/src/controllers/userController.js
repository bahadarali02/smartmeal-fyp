const bcrypt = require("bcryptjs");
const { User } = require("../models");

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
      error: error.message,
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      profileImageUrl,
      specialty,
      serviceArea,
      cnicImageUrl,
    } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    const existingEmailUser = await User.findOne({
      where: {
        email,
      },
    });

    if (
      existingEmailUser &&
      Number(existingEmailUser.id) !== Number(user.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Email is already used by another account.",
      });
    }

    user.name = name;
    user.email = email;
    user.phone = phone || null;
    user.address = address || null;
    user.profileImageUrl = profileImageUrl || null;

    if (user.role === "chef") {
      user.specialty = specialty || null;
      user.serviceArea = serviceArea || null;
      user.cnicImageUrl = cnicImageUrl || null;
    }

    await user.save();

    const updatedUser = await User.findByPk(user.id, {
      attributes: {
        exclude: ["password"],
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update password.",
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
};