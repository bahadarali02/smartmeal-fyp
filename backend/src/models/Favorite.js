const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Favorite = sequelize.define(
  "Favorite",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    mealId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "meals",
        key: "id",
      },
    },
  },
  {
    tableName: "favorites",
    timestamps: true,
  }
);

module.exports = Favorite;