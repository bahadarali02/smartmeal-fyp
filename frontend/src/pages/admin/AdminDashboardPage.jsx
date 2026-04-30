import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardTopbar from "../../components/layout/DashboardTopbar";
import api from "../../services/api";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toFixed(0)}`;
}

function formatStatus(status) {
  if (!status) {
    return "Pending";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getRoleBadgeStyle(role) {
  if (role === "admin") {
    return "badge-soft";
  }

  if (role === "chef") {
    return "badge-warning";
  }

  return "badge-success";
}

function getOrderStatusStyle(status) {
  if (status === "delivered") {
    return "badge-success";
  }

  if (status === "ready") {
    return "badge-warning";
  }

  return "badge-soft";
}

function DashboardIcon({ type }) {
  const common = "h-5 w-5";

  const icons = {
    users: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a6 6 0 0 1 12 0M17 10a3 3 0 1 0 0-6M16 21a5 5 0 0 1 5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    meals: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M4 11h16M6 11a6 6 0 0 1 12 0M7 16h10M9 20h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    orders: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M7 4h10l2 4v12H5V8l2-4ZM5 8h14M9 12h6M9 16h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    pending: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  return icons[type] || icons.users;
}

function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalMeals: 0,
      totalOrders: 0,
      pendingChefs: 0,
      pendingMeals: 0,
    },
    recentUsers: [],
    recentOrders: [],
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const savedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("smartmealUser")) || null;
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("smartmealToken");

        if (!token || !savedUser) {
          setErrorMessage("Please login first to view admin dashboard.");
          setLoading(false);
          return;
        }

        if (savedUser.role !== "admin") {
          setErrorMessage("Only admin accounts can access this dashboard.");
          setLoading(false);
          return;
        }

        const response = await api.get("/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboardData({
          stats: response.data.stats || {
            totalUsers: 0,
            totalMeals: 0,
            totalOrders: 0,
            pendingChefs: 0,
            pendingMeals: 0,
          },
          recentUsers: response.data.recentUsers || [],
          recentOrders: response.data.recentOrders || [],
        });
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message || "Failed to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [savedUser]);

  const stats = dashboardData.stats;
  const recentUsers = dashboardData.recentUsers || [];
  const recentOrders = dashboardData.recentOrders || [];

  const pendingWorkCount = Number(stats.pendingChefs || 0) + Number(stats.pendingMeals || 0);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role="admin" />

      <div className="flex-1">
        <DashboardTopbar
          title="Admin Dashboard"
          subtitle="Monitor SmartMeal users, chef verification, meal moderation, and marketplace order activity from one premium control workspace."
          actionLabel="Review Users"
          actionPath="/admin/users"
        />

        <main className="p-6 sm:p-8">
          {loading ? (
            <div className="loading-shell">
              <p className="text-sm font-semibold text-slate-500">
                Loading admin dashboard...
              </p>
            </div>
          ) : null}

          {!loading && errorMessage ? (
            <div className="rounded-[30px] border border-red-200 bg-red-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            </div>
          ) : null}

          {!loading && !errorMessage ? (
            <>
              <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="dashboard-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Total Users
                      </p>
                      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                        {String(stats.totalUsers || 0).padStart(2, "0")}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                      <DashboardIcon type="users" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Customers, chefs, and admins registered on SmartMeal.
                  </p>
                </div>

                <div className="dashboard-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Active Meals
                      </p>
                      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                        {String(stats.totalMeals || 0).padStart(2, "0")}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 shadow-sm">
                      <DashboardIcon type="meals" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Meal listings created by home chefs.
                  </p>
                </div>

                <div className="dashboard-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Total Orders
                      </p>
                      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                        {String(stats.totalOrders || 0).padStart(2, "0")}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm">
                      <DashboardIcon type="orders" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Orders placed through the local marketplace.
                  </p>
                </div>

                <div className="dashboard-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Pending Reviews
                      </p>
                      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                        {String(pendingWorkCount).padStart(2, "0")}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 shadow-sm">
                      <DashboardIcon type="pending" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Chef approvals and meal moderation items waiting.
                  </p>
                </div>
              </section>

              <section className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="panel-soft relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100/70 blur-3xl" />

                  <div className="relative">
                    <p className="badge-soft w-fit">Admin focus</p>

                    <h3 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
                      {pendingWorkCount > 0
                        ? `${pendingWorkCount} review item(s) need attention.`
                        : "Marketplace review queue is clear."}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      Keep SmartMeal trustworthy by reviewing chef applications,
                      checking real meal photos, and monitoring local marketplace
                      activity.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-4">
                        <p className="text-sm font-semibold text-amber-800">
                          Pending Chefs
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-amber-900">
                          {String(stats.pendingChefs || 0).padStart(2, "0")}
                        </p>
                      </div>

                      <div className="rounded-[24px] border border-orange-100 bg-orange-50 p-4">
                        <p className="text-sm font-semibold text-orange-800">
                          Pending Meals
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-orange-900">
                          {String(stats.pendingMeals || 0).padStart(2, "0")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <Link to="/admin/users" className="btn-primary text-center">
                        Review Users
                      </Link>
                      <Link to="/admin/meals" className="btn-secondary text-center">
                        Review Meals
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="panel-soft">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Quick Actions
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Moderate the marketplace from clear admin shortcuts.
                      </p>
                    </div>

                    <span className="badge-soft">Admin workspace</span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Link
                      to="/admin/users"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white transition group-hover:scale-105">
                        <DashboardIcon type="users" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        Manage Users
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Review customer, chef, and admin account details.
                      </p>
                    </Link>

                    <Link
                      to="/admin/meals"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 transition group-hover:scale-105">
                        <DashboardIcon type="meals" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        Moderate Meals
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Approve, reject, or remove suspicious meal listings.
                      </p>
                    </Link>

                    <Link
                      to="/admin/orders"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:scale-105">
                        <DashboardIcon type="orders" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        View Orders
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Monitor customer orders across the platform.
                      </p>
                    </Link>

                    <Link
                      to="/notifications"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:scale-105">
                        <DashboardIcon type="pending" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        Notifications
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Review admin and marketplace notifications.
                      </p>
                    </Link>
                  </div>
                </div>
              </section>

              <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
                <div className="table-shell">
                  <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Recent Users
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        New platform accounts and approval states.
                      </p>
                    </div>

                    <Link to="/admin/users" className="btn-secondary w-fit">
                      View Users
                    </Link>
                  </div>

                  {recentUsers.length === 0 ? (
                    <div className="px-6 py-8">
                      <div className="empty-state">
                        <p className="text-lg font-semibold text-slate-900">
                          No users found
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Registered users will appear here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentUsers.map((user) => (
                        <div
                          key={user.id}
                          className="grid gap-4 px-6 py-5 transition hover:bg-slate-50 sm:grid-cols-[48px_1fr_auto] sm:items-center"
                        >
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-sm font-semibold text-slate-500 shadow-sm">
                            {user.profileImageUrl ? (
                              <img
                                src={user.profileImageUrl}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              (user.name || "SM").slice(0, 2).toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {user.name}
                            </p>
                            <p className="mt-1 truncate text-sm text-slate-500">
                              {user.email}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            <span className={getRoleBadgeStyle(user.role)}>
                              {formatStatus(user.role)}
                            </span>

                            {user.role === "chef" ? (
                              <span
                                className={
                                  user.approvalStatus === "approved"
                                    ? "badge-success"
                                    : user.approvalStatus === "rejected"
                                    ? "badge-danger"
                                    : "badge-warning"
                                }
                              >
                                {formatStatus(user.approvalStatus)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="table-shell">
                  <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Recent Orders
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Latest customer orders across SmartMeal.
                      </p>
                    </div>

                    <Link to="/admin/orders" className="btn-secondary w-fit">
                      View Orders
                    </Link>
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="px-6 py-8">
                      <div className="empty-state">
                        <p className="text-lg font-semibold text-slate-900">
                          No orders found
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Customer orders will appear here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentOrders.map((order) => {
                        const total = (order.items || []).reduce((sum, item) => {
                          return (
                            sum +
                            Number(item.quantity || 0) *
                              Number(
                                item.meal?.price ||
                                  item.meal?.priceAtOrder ||
                                  0
                              )
                          );
                        }, 0);

                        return (
                          <div
                            key={order.id}
                            className="grid gap-4 px-6 py-5 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Order #SM-{order.id}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {order.customer?.name || "Customer"} •{" "}
                                {(order.items || []).length} item(s)
                              </p>
                            </div>

                            <span className={getOrderStatusStyle(order.status)}>
                              {formatStatus(order.status)}
                            </span>

                            <p className="text-sm font-semibold text-slate-900">
                              {formatCurrency(total)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardPage;