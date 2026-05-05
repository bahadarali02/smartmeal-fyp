import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardTopbar from "../../components/layout/DashboardTopbar";
import EmptyState from "../../components/common/EmptyState";
import {
  SkeletonLine,
  SkeletonStatCard,
  SkeletonTableRows,
} from "../../components/common/Skeleton";
import { getMyOrders } from "../../services/orderService";
import { getMyFavorites } from "../../services/favoriteService";
import { getMyFollowing } from "../../services/followService";

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
    favorites: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
    following: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M16 11a4 4 0 1 0-8 0M4 20a8 8 0 0 1 16 0M19 5v5M21.5 7.5h-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  return icons[type] || icons.meals;
}

function CustomerDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [following, setFollowing] = useState([]);
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
          const message = "Please login first to view your dashboard.";
          setErrorMessage(message);
          toast.error(message);
          setLoading(false);
          return;
        }

        if (savedUser.role !== "customer") {
          const message = "Only customer accounts can access this dashboard.";
          setErrorMessage(message);
          toast.error(message);
          setLoading(false);
          return;
        }

        const [ordersData, favoritesData, followingData] = await Promise.all([
          getMyOrders(token),
          getMyFavorites(token),
          getMyFollowing(token),
        ]);

        setOrders(ordersData.orders || []);
        setFavorites(favoritesData.favorites || []);
        setFollowing(followingData.following || []);
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          "Failed to load customer dashboard.";

        setErrorMessage(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [savedUser]);

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((total, order) => {
      const orderTotal = (order.items || []).reduce((sum, item) => {
        return (
          sum +
          Number(item.quantity || 0) *
            Number(item.meal?.price || item.meal?.priceAtOrder || 0)
        );
      }, 0);

      return total + orderTotal;
    }, 0);

    return {
      totalOrders: orders.length,
      activeOrders: orders.filter((order) => order.status !== "delivered")
        .length,
      favorites: favorites.length,
      following: following.length,
      totalSpent,
    };
  }, [orders, favorites, following]);

  const recentOrders = orders.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role="customer" />

      <div className="min-w-0 flex-1">
        <DashboardTopbar
          title="Customer Dashboard"
          subtitle="Track your local homemade food orders, saved meals, followed chefs, and quick actions from one clean workspace."
          actionLabel="Browse Meals"
          actionPath="/meals"
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <>
              <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
              </section>

              <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="panel-soft">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full max-w-sm space-y-3">
                      <SkeletonLine className="w-40" />
                      <SkeletonLine className="w-64 max-w-full" />
                    </div>

                    <SkeletonLine className="h-7 w-32" />
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                      <SkeletonLine className="h-11 w-11 rounded-2xl" />
                      <SkeletonLine className="mt-5 w-32" />
                      <SkeletonLine className="mt-3 w-full" />
                      <SkeletonLine className="mt-2 w-5/6" />
                    </div>

                    <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                      <SkeletonLine className="h-11 w-11 rounded-2xl" />
                      <SkeletonLine className="mt-5 w-32" />
                      <SkeletonLine className="mt-3 w-full" />
                      <SkeletonLine className="mt-2 w-5/6" />
                    </div>

                    <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                      <SkeletonLine className="h-11 w-11 rounded-2xl" />
                      <SkeletonLine className="mt-5 w-32" />
                      <SkeletonLine className="mt-3 w-full" />
                      <SkeletonLine className="mt-2 w-5/6" />
                    </div>

                    <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                      <SkeletonLine className="h-11 w-11 rounded-2xl" />
                      <SkeletonLine className="mt-5 w-32" />
                      <SkeletonLine className="mt-3 w-full" />
                      <SkeletonLine className="mt-2 w-5/6" />
                    </div>
                  </div>
                </div>

                <div className="panel-soft">
                  <SkeletonLine className="h-7 w-40" />
                  <SkeletonLine className="mt-5 h-10 w-44" />
                  <SkeletonLine className="mt-4 w-full" />
                  <SkeletonLine className="mt-2 w-5/6" />
                  <div className="mt-6 rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                    <SkeletonLine className="w-40" />
                    <SkeletonLine className="mt-3 w-full" />
                    <SkeletonLine className="mt-2 w-4/5" />
                  </div>
                  <SkeletonLine className="mt-6 h-12 w-full rounded-2xl" />
                </div>
              </section>

              <section className="mt-8 table-shell">
                <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-3">
                    <SkeletonLine className="w-40" />
                    <SkeletonLine className="w-64 max-w-full" />
                  </div>

                  <SkeletonLine className="h-12 w-36 rounded-2xl" />
                </div>

                <SkeletonTableRows rows={4} />
              </section>
            </>
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
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-500">
                        Total Orders
                      </p>
                      <h2 className="mt-3 break-words text-4xl font-semibold tracking-tight text-slate-900">
                        {String(stats.totalOrders).padStart(2, "0")}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                      <DashboardIcon type="orders" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Orders you placed from nearby home chefs.
                  </p>
                </div>

                <div className="dashboard-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-500">
                        Active Orders
                      </p>
                      <h2 className="mt-3 break-words text-4xl font-semibold tracking-tight text-slate-900">
                        {String(stats.activeOrders).padStart(2, "0")}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 shadow-sm">
                      <DashboardIcon type="meals" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Orders still being accepted, prepared, or delivered.
                  </p>
                </div>

                <div className="dashboard-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-500">
                        Favorites
                      </p>
                      <h2 className="mt-3 break-words text-4xl font-semibold tracking-tight text-slate-900">
                        {String(stats.favorites).padStart(2, "0")}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-sm">
                      <DashboardIcon type="favorites" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Meals saved to your personal wishlist.
                  </p>
                </div>

                <div className="dashboard-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-500">
                        Followed Chefs
                      </p>
                      <h2 className="mt-3 break-words text-4xl font-semibold tracking-tight text-slate-900">
                        {String(stats.following).padStart(2, "0")}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm">
                      <DashboardIcon type="following" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Trusted local chefs you follow.
                  </p>
                </div>
              </section>

              <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="panel-soft">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-slate-900">
                        Quick Actions
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Continue your SmartMeal journey quickly.
                      </p>
                    </div>

                    <span className="badge-soft w-fit">Local marketplace</span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Link
                      to="/meals"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white transition group-hover:scale-105">
                        <DashboardIcon type="meals" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        Browse Meals
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Explore approved homemade meals from local chefs.
                      </p>
                    </Link>

                    <Link
                      to="/customer/orders"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 transition group-hover:scale-105">
                        <DashboardIcon type="orders" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        View Orders
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Track placed, preparing, ready, and delivered orders.
                      </p>
                    </Link>

                    <Link
                      to="/customer/favorites"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition group-hover:scale-105">
                        <DashboardIcon type="favorites" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        Favorites
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Revisit meals you saved for later ordering.
                      </p>
                    </Link>

                    <Link
                      to="/customer/following"
                      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:scale-105">
                        <DashboardIcon type="following" />
                      </div>

                      <h4 className="mt-5 text-base font-semibold text-slate-900">
                        Following
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        See meals from local chefs you already trust.
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="panel-soft relative overflow-hidden">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100/70 blur-3xl" />

                  <div className="relative">
                    <p className="badge-soft w-fit">Spending overview</p>

                    <h3 className="mt-5 break-words text-3xl font-semibold tracking-tight text-slate-900">
                      {formatCurrency(stats.totalSpent)}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      Estimated total amount from your placed orders. SmartMeal
                      keeps pricing clear in PKR for local customers.
                    </p>

                    <div className="mt-6 rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-900">
                        Local delivery note
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Order from chefs serving your nearby area. Long-distance
                        delivery is not supported.
                      </p>
                    </div>

                    <Link to="/order" className="btn-primary mt-6 w-full">
                      Go to Cart
                    </Link>
                  </div>
                </div>
              </section>

              <section className="mt-8 table-shell">
                <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-5 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-slate-900">
                      Recent Orders
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Your latest homemade food orders.
                    </p>
                  </div>

                  <Link
                    to="/customer/orders"
                    className="btn-secondary w-full sm:w-fit"
                  >
                    View All Orders
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="px-4 py-8 sm:px-6">
                    <EmptyState
                      type="orders"
                      title="No orders yet"
                      message="Browse local meals and place your first SmartMeal order."
                      actionLabel="Browse Meals"
                      actionPath="/meals"
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentOrders.map((order) => {
                      const total = (order.items || []).reduce((sum, item) => {
                        return (
                          sum +
                          Number(item.quantity || 0) *
                            Number(
                              item.meal?.price || item.meal?.priceAtOrder || 0
                            )
                        );
                      }, 0);

                      return (
                        <div
                          key={order.id}
                          className="grid gap-4 px-4 py-5 transition hover:bg-slate-50 sm:px-6 md:grid-cols-[1fr_auto_auto] md:items-center"
                        >
                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold text-slate-900">
                              Order #SM-{order.id}
                            </p>
                            <p className="mt-1 break-words text-sm text-slate-500">
                              {(order.items || []).length} item(s) •{" "}
                              {order.paymentMethod || "Cash on Delivery"}
                            </p>
                          </div>

                          <span className={`${getStatusStyle(order.status)} w-fit`}>
                            {formatStatus(order.status)}
                          </span>

                          <p className="break-words text-sm font-semibold text-slate-900 md:text-right">
                            {formatCurrency(total)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default CustomerDashboardPage;