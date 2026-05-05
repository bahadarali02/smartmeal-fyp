import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardTopbar from "../../components/layout/DashboardTopbar";
import EmptyState from "../../components/common/EmptyState";
import {
  SkeletonLine,
  SkeletonStatCard,
} from "../../components/common/Skeleton";
import api from "../../services/api";
import { getFullImageUrl } from "../../services/uploadService";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toFixed(0)}`;
}

function formatStatus(status) {
  if (!status) {
    return "Placed";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value) {
  if (!value) {
    return "Recently";
  }

  return new Date(value).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

function OrderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M7 4h10l2 4v12H5V8l2-4ZM5 8h14M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 21s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 7h16v10H4V7ZM4 10h16M8 15h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChefIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a6 6 0 0 1 12 0M17 10a3 3 0 1 0 0-6M16 21a5 5 0 0 1 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getOrderTotal(order) {
  return (order.items || []).reduce((sum, item) => {
    return (
      sum +
      Number(item.quantity || 0) *
        Number(item.priceAtOrder || item.meal?.price || 0)
    );
  }, 0);
}

function getOrderChefNames(order) {
  const chefNames = (order.items || [])
    .map((item) => item.meal?.chef?.name)
    .filter(Boolean);

  return [...new Set(chefNames)];
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const savedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("smartmealUser")) || null;
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("smartmealToken");

        if (!token || !savedUser) {
          const message = "Please login first to view admin orders.";
          setErrorMessage(message);
          toast.error(message);
          setLoading(false);
          return;
        }

        if (savedUser.role !== "admin") {
          const message = "Only admin accounts can view this page.";
          setErrorMessage(message);
          toast.error(message);
          setLoading(false);
          return;
        }

        const response = await api.get("/admin/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data.orders || []);
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to fetch admin orders.";

        setErrorMessage(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [savedUser]);

  const stats = useMemo(() => {
    const activeOrders = orders.filter(
      (order) => order.status !== "delivered"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + getOrderTotal(order);
    }, 0);

    const uniqueCustomers = [
      ...new Set(orders.map((order) => order.customer?.id).filter(Boolean)),
    ].length;

    return {
      totalOrders: orders.length,
      activeOrders,
      deliveredOrders,
      totalRevenue,
      uniqueCustomers,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role="admin" />

      <div className="min-w-0 flex-1">
        <DashboardTopbar
          title="Admin Orders"
          subtitle="Monitor all SmartMeal orders, customer details, receiver information, involved chefs, payment method, and local delivery addresses."
          actionLabel="Back to Admin"
          actionPath="/admin/dashboard"
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

              <section className="mt-8 space-y-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70"
                  >
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-5 sm:px-6">
                      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="space-y-3">
                          <SkeletonLine className="h-6 w-44" />
                          <SkeletonLine className="w-36" />
                        </div>

                        <div className="space-y-3 lg:text-right">
                          <SkeletonLine className="w-24" />
                          <SkeletonLine className="h-8 w-32" />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[1.15fr_0.85fr]">
                      <div>
                        <SkeletonLine className="w-36" />

                        <div className="mt-4 space-y-3">
                          {Array.from({ length: 2 }).map((__, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[64px_1fr_auto] sm:items-center"
                            >
                              <SkeletonLine className="h-16 w-16 rounded-2xl" />

                              <div className="space-y-3">
                                <SkeletonLine className="w-40" />
                                <SkeletonLine className="w-52 max-w-full" />
                              </div>

                              <SkeletonLine className="w-24" />
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex items-start gap-3">
                            <SkeletonLine className="h-11 w-11 rounded-2xl" />
                            <div className="flex-1 space-y-3">
                              <SkeletonLine className="w-40" />
                              <SkeletonLine className="w-full" />
                              <SkeletonLine className="w-4/5" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {Array.from({ length: 4 }).map((__, cardIndex) => (
                          <div
                            key={cardIndex}
                            className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <SkeletonLine className="h-11 w-11 rounded-2xl" />
                              <div className="flex-1 space-y-3">
                                <SkeletonLine className="w-36" />
                                <SkeletonLine className="w-full" />
                                <SkeletonLine className="w-4/5" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
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
                  <p className="text-sm font-medium text-slate-500">
                    Total Orders
                  </p>
                  <h2 className="mt-3 break-words text-4xl font-semibold tracking-tight text-slate-900">
                    {String(stats.totalOrders).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    All orders placed across SmartMeal.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Active Orders
                  </p>
                  <h2 className="mt-3 break-words text-4xl font-semibold tracking-tight text-slate-900">
                    {String(stats.activeOrders).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Orders not delivered yet.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Delivered
                  </p>
                  <h2 className="mt-3 break-words text-4xl font-semibold tracking-tight text-slate-900">
                    {String(stats.deliveredOrders).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Completed chef-managed deliveries.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Total Value
                  </p>
                  <h2 className="mt-3 break-words text-3xl font-semibold tracking-tight text-slate-900">
                    {formatCurrency(stats.totalRevenue)}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Estimated total order value in PKR.
                  </p>
                </div>
              </section>

              <section className="mt-8">
                {orders.length === 0 ? (
                  <EmptyState
                    type="orders"
                    title="No orders found"
                    message="Marketplace orders will appear here after customers place orders from approved local chefs."
                  />
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      const total = getOrderTotal(order);
                      const chefNames = getOrderChefNames(order);

                      return (
                        <article
                          key={order.id}
                          className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70"
                        >
                          <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-5 sm:px-6">
                            <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                                    <OrderIcon />
                                  </div>

                                  <div className="min-w-0">
                                    <h3 className="break-words text-xl font-semibold text-slate-900">
                                      Order #SM-{order.id}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                      Placed on {formatDate(order.createdAt)}
                                    </p>
                                  </div>

                                  <span
                                    className={`${getStatusStyle(
                                      order.status
                                    )} w-fit`}
                                  >
                                    {formatStatus(order.status)}
                                  </span>
                                </div>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
                                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Total
                                  </p>
                                  <p className="mt-1 break-words text-base font-semibold text-slate-900">
                                    {formatCurrency(total)}
                                  </p>
                                </div>

                                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Items
                                  </p>
                                  <p className="mt-1 text-base font-semibold text-slate-900">
                                    {(order.items || []).length}
                                  </p>
                                </div>

                                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Chefs
                                  </p>
                                  <p className="mt-1 text-base font-semibold text-slate-900">
                                    {chefNames.length || 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[1.15fr_0.85fr]">
                            <div className="min-w-0 space-y-6">
                              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <h4 className="text-base font-semibold text-slate-900">
                                      Ordered Items
                                    </h4>
                                    <p className="mt-1 text-sm text-slate-500">
                                      Meals included in this marketplace order.
                                    </p>
                                  </div>

                                  <span className="badge-soft w-fit">
                                    {(order.items || []).length} item(s)
                                  </span>
                                </div>

                                <div className="mt-4 space-y-3">
                                  {(order.items || []).map((item) => {
                                    const meal = item.meal;
                                    const itemTotal =
                                      Number(item.quantity || 0) *
                                      Number(
                                        item.priceAtOrder || meal?.price || 0
                                      );

                                    return (
                                      <div
                                        key={item.id}
                                        className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[64px_1fr_auto] sm:items-center"
                                      >
                                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
                                          {meal?.imageUrl ? (
                                            <img
                                              src={getFullImageUrl(
                                                meal.imageUrl
                                              )}
                                              alt={meal.name || "Meal"}
                                              loading="lazy"
                                              onError={(event) => {
                                                event.currentTarget.style.display =
                                                  "none";
                                              }}
                                              className="h-full w-full object-cover"
                                            />
                                          ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                              Meal
                                            </div>
                                          )}
                                        </div>

                                        <div className="min-w-0">
                                          <p className="break-words text-sm font-semibold text-slate-900">
                                            {meal?.name || "Meal"}
                                          </p>
                                          <p className="mt-1 break-words text-sm text-slate-500">
                                            Chef:{" "}
                                            {meal?.chef?.name ||
                                              "Local Chef"}{" "}
                                            • Qty {item.quantity}
                                          </p>
                                          <p className="mt-1 text-xs text-slate-400">
                                            Unit price:{" "}
                                            {formatCurrency(
                                              item.priceAtOrder ||
                                                meal?.price ||
                                                0
                                            )}
                                          </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-left sm:text-right">
                                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            Item Total
                                          </p>
                                          <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                                            {formatCurrency(itemTotal)}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                    <ChefIcon />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                      Involved Chef(s)
                                    </p>

                                    {chefNames.length > 0 ? (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {chefNames.map((chefName) => (
                                          <span
                                            key={chefName}
                                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                                          >
                                            {chefName}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Chef information not available.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <aside className="space-y-4">
                              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                    <UserIcon />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">
                                      Customer Account
                                    </p>
                                    <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                                      {order.customer?.name ||
                                        "Customer name not available"}
                                    </p>
                                    <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                                      {order.customer?.email ||
                                        "Email not available"}
                                    </p>
                                    <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                                      {order.customer?.phone ||
                                        "Phone not available"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                    <OrderIcon />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">
                                      Receiver Details
                                    </p>
                                    <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                                      {order.receiverName ||
                                        order.customer?.name ||
                                        "Receiver name not available"}
                                    </p>
                                    <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                                      {order.receiverPhone ||
                                        order.customer?.phone ||
                                        "Phone number not available"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                                    <LocationIcon />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">
                                      Delivery Address
                                    </p>

                                    {order.area || order.city ? (
                                      <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-700">
                                        {[order.area, order.city]
                                          .filter(Boolean)
                                          .join(", ")}
                                      </p>
                                    ) : null}

                                    <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                                      {order.address ||
                                        "No address available."}
                                    </p>

                                    {order.deliveryNote ? (
                                      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                          Delivery Note
                                        </p>
                                        <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                                          {order.deliveryNote}
                                        </p>
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                    <PaymentIcon />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">
                                      Payment Method
                                    </p>
                                    <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                                      {order.paymentMethod ||
                                        "Cash on Delivery"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-5">
                                <p className="text-sm font-semibold text-emerald-800">
                                  Marketplace delivery visibility
                                </p>
                                <p className="mt-2 text-sm leading-6 text-emerald-700">
                                  Admin can review customer, receiver, chef, and
                                  local delivery details for trust and
                                  marketplace moderation.
                                </p>
                              </div>
                            </aside>
                          </div>
                        </article>
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

export default AdminOrdersPage;