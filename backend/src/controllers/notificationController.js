const { Notification } = require("../models");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        userId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully.",
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
      error: error.message,
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          userId: req.user.id,
          isRead: false,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
      error: error.message,
    });
  }
};

const createMarketplaceNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "User ID, title, and message are required.",
      });
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type: "marketplace_update",
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      message: "Marketplace notification created successfully.",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create marketplace notification.",
      error: error.message,
    });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createMarketplaceNotification,
};