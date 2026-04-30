import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import DashboardTopbar from "../components/layout/DashboardTopbar";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

function getDashboardPath(role) {
  if (role === "customer") {
    return "/customer/dashboard";
  }

  if (role === "chef") {
    return "/chef/dashboard";
  }

  if (role === "admin") {
    return "/admin/dashboard";
  }

  return "/";
}

function formatNotificationType(type) {
  if (type === "order_update") {
    return "Order Update";
  }

  if (type === "new_meal") {
    return "New Meal";
  }

  return "Marketplace Update";
}

function getNotificationTypeStyle(type) {
  if (type === "order_update") {
    return "border border-blue-100 bg-blue-50 text-blue-700";
  }

  if (type === "new_meal") {
    return "border border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  return "border border-slate-200 bg-slate-50 text-slate-700";
}

function formatDate(value) {
  if (!value) {
    return "Recently";
  }

  return new Date(value).toLocaleString();
}

function NotificationsPage() {
  const savedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("smartmealUser")) || null;
  }, []);

  const role = savedUser?.role || "customer";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token || !savedUser) {
        setErrorMessage("Please login first to view notifications.");
        setLoading(false);
        return;
      }

      const data = await getMyNotifications(token);

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to fetch notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(
      (notification) => !notification.isRead
    ).length;
    const orderUpdates = notifications.filter(
      (notification) => notification.type === "order_update"
    ).length;

    return {
      total,
      unread,
      orderUpdates,
    };
  }, [notifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token) {
        setErrorMessage("Please login first.");
        return;
      }

      setActionLoadingId(notificationId);

      await markNotificationAsRead(notificationId, token);
      setSuccessMessage("Notification marked as read.");
      await fetchNotifications();

      setTimeout(() => {
        setSuccessMessage("");
      }, 1800);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to mark notification as read."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token) {
        setErrorMessage("Please login first.");
        return;
      }

      setMarkAllLoading(true);

      await markAllNotificationsAsRead(token);
      setSuccessMessage("All notifications marked as read.");
      await fetchNotifications();

      setTimeout(() => {
        setSuccessMessage("");
      }, 1800);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to mark all notifications as read."
      );
    } finally {
      setMarkAllLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role={role} />

      <div className="flex-1">
        <DashboardTopbar
          title="Notifications"
          subtitle="View important SmartMeal updates about orders, chef activity, approvals, and marketplace messages."
          actionLabel="Back to Dashboard"
          actionPath={getDashboardPath(role)}
        />

        <main className="p-6 sm:p-8">
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Notifications
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                {String(stats.total).padStart(2, "0")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                All updates sent to your account
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Unread Notifications
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                {String(unreadCount || stats.unread).padStart(2, "0")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Updates that still need your attention
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Order Updates
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                {String(stats.orderUpdates).padStart(2, "0")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Notifications related to order progress
              </p>
            </div>
          </section>

          {successMessage ? (
            <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-emerald-700">
                {successMessage}
              </p>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : null}

          {!loading && errorMessage ? (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
              <p className="text-sm font-medium text-red-700">
                {errorMessage}
              </p>
            </div>
          ) : null}

          {!loading && !errorMessage ? (
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Notification Center
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Recent account updates and marketplace activity.
                  </p>
                </div>

                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllLoading || notifications.length === 0}
                  className="btn-secondary w-fit disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {markAllLoading ? "Updating..." : "Mark All Read"}
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="px-6 py-8">
                  <p className="text-lg font-semibold text-slate-900">
                    No notifications yet
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Order updates, chef approvals, meal approvals, and followed
                    chef updates will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-6 py-5 ${
                        notification.isRead ? "bg-white" : "bg-slate-50/70"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getNotificationTypeStyle(
                                notification.type
                              )}`}
                            >
                              {formatNotificationType(notification.type)}
                            </span>

                            {!notification.isRead ? (
                              <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                                Unread
                              </span>
                            ) : (
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                                Read
                              </span>
                            )}
                          </div>

                          <h4 className="mt-3 text-lg font-semibold text-slate-900">
                            {notification.title}
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {notification.message}
                          </p>

                          <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>

                        {!notification.isRead ? (
                          <button
                            onClick={() =>
                              handleMarkAsRead(notification.id)
                            }
                            disabled={actionLoadingId === notification.id}
                            className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {actionLoadingId === notification.id
                              ? "Updating..."
                              : "Mark Read"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default NotificationsPage;