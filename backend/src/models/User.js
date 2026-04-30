const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Name is required.",
        },
      },
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Email is required.",
        },
        isEmail: {
          msg: "Please enter a valid email address.",
        },
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password is required.",
        },
      },
    },

    role: {
      type: DataTypes.ENUM("customer", "chef", "admin"),
      allowNull: false,
      defaultValue: "customer",
      validate: {
        notEmpty: {
          msg: "Role is required.",
        },
      },
    },

    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    profileImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    cnicImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    specialty: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },

    serviceArea: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    approvalStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "approved",
    },

    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

module.exports = User;