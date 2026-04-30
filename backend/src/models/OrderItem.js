const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isInt: {
          msg: "Quantity must be a whole number.",
        },
        min: {
          args: [1],
          msg: "Quantity must be at least 1.",
        },
      },
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
  }
);

module.exports = OrderItem;