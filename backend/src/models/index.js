const User = require("./User");
const Meal = require("./Meal");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Favorite = require("./Favorite");
const Follow = require("./Follow");
const Notification = require("./Notification");
const Review = require("./Review"); // ✅ NEW

User.hasMany(Meal, {
  foreignKey: "chefId",
  as: "meals",
});

Meal.belongsTo(User, {
  foreignKey: "chefId",
  as: "chef",
});

User.hasMany(Order, {
  foreignKey: "customerId",
  as: "orders",
});

Order.belongsTo(User, {
  foreignKey: "customerId",
  as: "customer",
});

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

Meal.hasMany(OrderItem, {
  foreignKey: "mealId",
  as: "orderItems",
});

OrderItem.belongsTo(Meal, {
  foreignKey: "mealId",
  as: "meal",
});

User.hasMany(Favorite, {
  foreignKey: "customerId",
  as: "favorites",
});

Favorite.belongsTo(User, {
  foreignKey: "customerId",
  as: "customer",
});

Meal.hasMany(Favorite, {
  foreignKey: "mealId",
  as: "favorites",
});

Favorite.belongsTo(Meal, {
  foreignKey: "mealId",
  as: "meal",
});

User.hasMany(Follow, {
  foreignKey: "customerId",
  as: "following",
});

Follow.belongsTo(User, {
  foreignKey: "customerId",
  as: "customer",
});

User.hasMany(Follow, {
  foreignKey: "chefId",
  as: "followers",
});

Follow.belongsTo(User, {
  foreignKey: "chefId",
  as: "chef",
});

User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
});

Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

/* ✅ REVIEW RELATIONS */
Meal.hasMany(Review, {
  foreignKey: "mealId",
  as: "reviews",
});

Review.belongsTo(Meal, {
  foreignKey: "mealId",
  as: "meal",
});

User.hasMany(Review, {
  foreignKey: "customerId",
  as: "reviews",
});

Review.belongsTo(User, {
  foreignKey: "customerId",
  as: "customer",
});

module.exports = {
  User,
  Meal,
  Order,
  OrderItem,
  Favorite,
  Follow,
  Notification,
  Review, // ✅ NEW
};