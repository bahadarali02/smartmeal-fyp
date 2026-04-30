const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "placed",
        "accepted",
        "preparing",
        "ready",
        "delivered"
      ),
      allowNull: false,
      defaultValue: "placed",
    },

    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Cash on Delivery",
    },

    receiverName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    receiverPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    area: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    deliveryNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

module.exports = Order;