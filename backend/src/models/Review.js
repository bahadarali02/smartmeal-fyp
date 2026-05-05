const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    mealId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "meals",
        key: "id",
      },
    },

    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
  }
);

module.exports = Review;