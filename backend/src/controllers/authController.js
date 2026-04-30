const bcrypt = require("bcryptjs");
const { User } = require("../models");
const generateToken = require("../utils/generateToken");

const buildUserResponse = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    profileImageUrl: user.profileImageUrl,
    cnicImageUrl: user.cnicImageUrl,
    specialty: user.specialty,
    serviceArea: user.serviceArea,
    approvalStatus: user.approvalStatus,
    rejectionReason: user.rejectionReason,
  };
};

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      profileImageUrl,
      cnicImageUrl,
      specialty,
      serviceArea,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required.",
      });
    }

    if (!["customer", "chef"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Only customer and chef roles are allowed during signup.",
      });
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || null,
      address: address || null,
      profileImageUrl: profileImageUrl || null,
      cnicImageUrl: cnicImageUrl || null,
      specialty: specialty || null,
      serviceArea: serviceArea || null,
      approvalStatus: role === "chef" ? "pending" : "approved",
      rejectionReason: null,
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message:
        role === "chef"
          ? "Chef account created successfully. Your account is pending admin approval."
          : "User registered successfully.",
      token,
      user: buildUserResponse(newUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};