const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Meal = sequelize.define(
  "Meal",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    chefId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Meal name is required.",
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Meal description is required.",
        },
      },
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Meal price is required.",
        },
        isDecimal: {
          msg: "Price must be a valid number.",
        },
      },
    },

    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    imageAspectRatio: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "4:3",
    },

    moderationStatus: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "approved",
    },

    moderationNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    availability: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "meals",
    timestamps: true,
  }
);

module.exports = Meal;