const jwt = require("jsonwebtoken");
const { User } = require("../models");

const protect = async (req, res, next) => {
  try {
    let token;

    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      token = authorizationHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
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
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid token.",
      error: error.message,
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login first.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You do not have permission to perform this action.",
      });
    }

    if (
      req.user.role === "chef" &&
      allowedRoles.includes("chef") &&
      req.user.approvalStatus !== "approved"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Chef account is pending admin approval. You cannot access chef features yet.",
        approvalStatus: req.user.approvalStatus,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};