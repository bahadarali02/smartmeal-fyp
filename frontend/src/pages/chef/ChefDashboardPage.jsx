import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardTopbar from "../../components/layout/DashboardTopbar";
import { getChefMeals } from "../../services/mealService";
import { getChefOrders } from "../../services/orderService";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toFixed(0)}`;
}

function formatStatus(status) {
  if (!status) {
    return "Placed";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusStyle(status) {
  if (status === "delivered") {
    return "badge-success";
  }

  if (status === "ready") {
    return "badge-warning";
  }

  if (status === "preparing" || status === "accepted") {
    return "badge-soft";
  }

  return "badge-soft";
}

function getApprovalStyle(status) {
  if (status === "approved") {
    return "badge-success";
  }

  if (status === "rejected") {
    return "badge-danger";
  }

  return "badge-warning";
}

function getModerationStyle(status) {
  if (status === "approved") {
    return "badge-success";
  }

  if (status === "rejected") {
    return "badge-danger";
  }

  return "badge-warning";
}

function DashboardIcon({ type }) {
  const common = "h-5 w-5";

  const icons = {
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
    revenue: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M12 3v18M17 7.5c0-1.4-1.7-2.5-4-2.5s-4 1.1-4 2.5 1.4 2.2 4 2.7c2.6.5 4 1.2 4 2.8s-1.7 3-4 3-4-1.3-4-3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    approval: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m9 12 2 2 4-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  return icons[type] || icons.meals;
}

function getChefOrderItems(order, currentChefId) {
  if (!order?.items || !Array.isArray(order.items)) {
    return [];
  }

  return order.items.filter(
    (item) => Number(item.meal?.chefId) === Number(currentChefId)
  );
}

function ChefDashboardPage() {
  const [meals, setMeals] = useState([]);
  const [orders, setOrders] = useState([]);
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
          setErrorMessage("Please login first to view your chef dashboard.");
          setLoading(false);
          return;
        }

        if (savedUser.role !== "chef") {
          setErrorMessage("Only chef accounts can access this dashboard.");
          setLoading(false);
          return;
        }

        const [mealData, orderData] = await Promise.all([
          getChefMeals(token),
          getChefOrders(token),
        ]);

        setMeals(mealData.meals || []);
        setOrders(orderData.orders || []);
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message || "Failed to load chef dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [savedUser]);

  const stats = useMemo(() => {
    const approvedMeals = meals.filter(
      (meal) => meal.moderationStatus === "approved"
    ).length;

    const pendingMeals = meals.filter(
      (meal) => meal.moderationStatus === "pending"
    ).length;

    const activeOrders = orders.filter(
      (order) => order.status !== "delivered"
    ).length;

    const estimatedRevenue = orders.reduce((total, order) => {
      const chefItems = getChefOrderItems(order, savedUser?.id);

      const orderTotal = chefItems.reduce((sum, item) => {
        return (
          sum +
          Number(item.quantity || 0) *
            Number(item.meal?.price || item.meal?.priceAtOrder || 0)
        );
      }, 0);

      return total + orderTotal;
    }, 0);

    return {
      totalMeals: meals.length,
      approvedMeals,
      pendingMeals,
      totalOrders: orders.length,
      activeOrders,
      estimatedRevenue,
    };
  }, [meals, orders, savedUser]);

  const recentOrders = orders.slice(0, 4);
  const recentMeals = meals.slice(0, 4);
  const approvalStatus = savedUser?.approvalStatus || "pending";

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role="chef" />

      <div className="flex-1">
        <DashboardTopbar
          title="Chef Dashboard"
          subtitle="Manage your homemade meal listings, local orders, chef verification, and delivery workflow from one polished workspace."
          actionLabel="Manage Meals"
          actionPath="/chef/meals"
        />

        <main className="p-6 sm:p-8">
          {loading ? (
            <div className="loading-shell">
              <p className="text-sm font-semibold text-slate-500">
                Loading your chef dashboard...
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
                        Total Meals
                      </p>
                      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                        {String(stats.totalMeals).padStart(2, "0")}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                      <DashboardIcon type="meals" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Meals created in your chef menu.
                  </p>
                </div>

                <div className="dashboard-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Approved Meals
                      </p>
                      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                        {String(stats.approvedMeals).padStart(2, "0")}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm">
                      <DashboardIcon type="approval" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Meals visible to customers after admin review.
                  </p>
                </div>

                <div className="dashboard-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Active Orders
                      </p>
                      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                        {String(stats.activeOrders).padStart(2, "0")}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 shadow-sm">
                      <DashboardIcon type="orders" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Orders still in progress before delivery.
                  </p>
                </div>

                <div className="dashboard-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Estimated Sales
                      </p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                        {formatCurrency(stats.estimatedRevenue)}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-sm">
                      <DashboardIcon type="revenue" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Estimated total from your order items.
                  </p>
                </div>
              </section>

              <section className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="panel-soft relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100/70 blur-3xl" />

                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="badge-soft">Chef verification</p>
                      <span className={getApprovalStyle(approvalStatus)}>
                        {approvalStatus.charAt(0).toUpperCase() +
                          approvalStatus.slice(1)}
                      </span>
                    </div>

                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
                      {approvalStatus === "approved"
                        ? "Your chef profile is approved."
                        : approvalStatus === "rejected"
                        ? "Your chef profile needs attention."
                        : "Your chef profile is under review."}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      Approved chefs can manage meals and receive orders.
                      SmartMeal keeps chef onboarding clear so customers can
                      trust local homemade food providers.
                    </p>

                    {savedUser?.rejectionReason ? (
                      <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-700">
                          Rejection reason
                        </p>
                        <p className="mt-2 text-sm leading-6 text-red-600">
                          {savedUser.rejectionReason}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <Link to="/profile" className="btn-secondary text-center">
                        Update Profile
                      </Link>
                      <Link
                        to="/notifications"
                        className="btn-secondary text-center"
                      >
                        View Notifications
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
                        Manage your chef workflow quickly.
                      </p>
                    </div>

                    <span className="badge-soft">Chef workspace</span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Link
                      to="/chef/meals"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white transition group-hover:scale-105">
                        <DashboardIcon type="meals" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        Manage Meals
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Create, edit, and submit meals for admin moderation.
                      </p>
                    </Link>

                    <Link
                      to="/chef/orders"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 transition group-hover:scale-105">
                        <DashboardIcon type="orders" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        View Orders
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Accept orders and update the preparation status.
                      </p>
                    </Link>

                    <Link
                      to="/profile"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:scale-105">
                        <DashboardIcon type="approval" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        Chef Profile
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Keep phone, address, specialty, and service area clear.
                      </p>
                    </Link>

                    <Link
                      to="/notifications"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:scale-105">
                        <DashboardIcon type="orders" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        Notifications
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Review order, approval, and meal moderation updates.
                      </p>
                    </Link>
                  </div>
                </div>
              </section>

              <section className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="table-shell">
                  <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Recent Orders
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Latest customer orders containing your meals.
                      </p>
                    </div>

                    <Link to="/chef/orders" className="btn-secondary w-fit">
                      View All Orders
                    </Link>
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="px-6 py-8">
                      <div className="empty-state">
                        <p className="text-lg font-semibold text-slate-900">
                          No orders yet
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          New customer orders will appear here once customers
                          order your approved meals.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentOrders.map((order) => {
                        const chefItems = getChefOrderItems(
                          order,
                          savedUser?.id
                        );

                        const total = chefItems.reduce((sum, item) => {
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
                            className="grid gap-4 px-6 py-5 transition hover:bg-slate-50 md:grid-cols-[1fr_auto_auto] md:items-center"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Order #SM-{order.id}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {chefItems.length} item(s) •{" "}
                                {order.customer?.name || "Customer"}
                              </p>
                            </div>

                            <span className={getStatusStyle(order.status)}>
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

                <div className="table-shell">
                  <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Recent Meals
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Your newest meal listings and moderation status.
                      </p>
                    </div>

                    <Link to="/chef/meals" className="btn-secondary w-fit">
                      Manage Meals
                    </Link>
                  </div>

                  {recentMeals.length === 0 ? (
                    <div className="px-6 py-8">
                      <div className="empty-state">
                        <p className="text-lg font-semibold text-slate-900">
                          No meals created yet
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Add your first homemade meal and submit it for admin
                          review.
                        </p>
                        <Link to="/chef/meals" className="btn-primary mt-5">
                          Add Meal
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentMeals.map((meal) => (
                        <div
                          key={meal.id}
                          className="grid gap-4 px-6 py-5 transition hover:bg-slate-50 sm:grid-cols-[64px_1fr_auto] sm:items-center"
                        >
                          <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                            {meal.imageUrl ? (
                              <img
                                src={meal.imageUrl}
                                alt={meal.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                Meal
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {meal.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {formatCurrency(meal.price)} •{" "}
                              {meal.availability ? "Available" : "Unavailable"}
                            </p>
                          </div>

                          <span
                            className={getModerationStyle(
                              meal.moderationStatus || "pending"
                            )}
                          >
                            {formatStatus(meal.moderationStatus || "pending")}
                          </span>
                        </div>
                      ))}
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

export default ChefDashboardPage;