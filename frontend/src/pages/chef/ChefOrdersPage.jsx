import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardTopbar from "../../components/layout/DashboardTopbar";
import {
  getChefOrders,
  updateChefOrderStatus,
} from "../../services/orderService";
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

function getOrderTotal(order) {
  return (order.items || []).reduce((sum, item) => {
    return (
      sum +
      Number(item.quantity || 0) *
        Number(item.priceAtOrder || item.meal?.price || 0)
    );
  }, 0);
}

function ChefOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const savedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("smartmealUser")) || null;
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token || !savedUser) {
        setErrorMessage("Please login first to view chef orders.");
        setLoading(false);
        return;
      }

      if (savedUser.role !== "chef") {
        setErrorMessage("Only chef accounts can view this page.");
        setLoading(false);
        return;
      }

      const data = await getChefOrders(token);
      setOrders(data.orders || []);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to fetch chef orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [savedUser]);

  const stats = useMemo(() => {
    const activeOrders = orders.filter(
      (order) => order.status !== "delivered"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    const estimatedSales = orders.reduce((sum, order) => {
      return sum + getOrderTotal(order);
    }, 0);

    return {
      totalOrders: orders.length,
      activeOrders,
      deliveredOrders,
      estimatedSales,
    };
  }, [orders]);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token) {
        setErrorMessage("Please login first.");
        return;
      }

      await updateChefOrderStatus(orderId, status, token);

      setSuccessMessage("Order status updated successfully.");
      await fetchOrders();

      setTimeout(() => {
        setSuccessMessage("");
      }, 2200);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role="chef" />

      <div className="flex-1">
        <DashboardTopbar
          title="Chef Orders"
          subtitle="Manage customer orders, receiver information, local delivery address, payment method, and preparation status."
          actionLabel="Manage Meals"
          actionPath="/chef/meals"
        />

        <main className="p-6 sm:p-8">
          {successMessage ? (
            <div className="mb-6 rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-emerald-700">
                {successMessage}
              </p>
            </div>
          ) : null}

          {loading ? (
            <div className="loading-shell">
              <p className="text-sm font-semibold text-slate-500">
                Loading chef orders...
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
                  <p className="text-sm font-medium text-slate-500">
                    Total Orders
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {String(stats.totalOrders).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Orders containing your homemade meals.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Active Orders
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {String(stats.activeOrders).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Orders still accepted, preparing, or ready.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Delivered
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {String(stats.deliveredOrders).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Completed chef-managed deliveries.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Estimated Sales
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                    {formatCurrency(stats.estimatedSales)}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Estimated order value from your meal items.
                  </p>
                </div>
              </section>

              <section className="mt-8">
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <OrderIcon />
                    </div>

                    <p className="mt-5 text-xl font-semibold text-slate-900">
                      No orders yet
                    </p>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Customer orders containing your approved homemade meals
                      will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      const total = getOrderTotal(order);

                      return (
                        <div
                          key={order.id}
                          className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70"
                        >
                          <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-xl font-semibold text-slate-900">
                                  Order #SM-{order.id}
                                </h3>

                                <span className={getStatusStyle(order.status)}>
                                  {formatStatus(order.status)}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-slate-500">
                                Placed on {formatDate(order.createdAt)}
                              </p>
                            </div>

                            <div className="text-left lg:text-right">
                              <p className="text-sm text-slate-500">
                                Order Total
                              </p>
                              <p className="mt-1 text-2xl font-semibold text-slate-900">
                                {formatCurrency(total)}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-6 p-6 xl:grid-cols-[1.1fr_0.9fr]">
                            <div>
                              <h4 className="text-base font-semibold text-slate-900">
                                Ordered Items
                              </h4>

                              <div className="mt-4 space-y-3">
                                {(order.items || []).map((item) => {
                                  const meal = item.meal;
                                  const itemTotal =
                                    Number(item.quantity || 0) *
                                    Number(item.priceAtOrder || meal?.price || 0);

                                  return (
                                    <div
                                      key={item.id}
                                      className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[64px_1fr_auto] sm:items-center"
                                    >
                                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-sm">
                                        {meal?.imageUrl ? (
                                          <img
                                            src={getFullImageUrl(meal.imageUrl)}
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
                                          {meal?.name || "Meal"}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                          Customer:{" "}
                                          {order.customer?.name || "Customer"} •
                                          Qty {item.quantity}
                                        </p>
                                      </div>

                                      <p className="text-sm font-semibold text-slate-900">
                                        {formatCurrency(itemTotal)}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-sm font-semibold text-slate-900">
                                  Update Order Status
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                  Use the correct order flow: Placed → Accepted
                                  → Preparing → Ready → Delivered.
                                </p>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                  {[
                                    "accepted",
                                    "preparing",
                                    "ready",
                                    "delivered",
                                  ].map((status) => (
                                    <button
                                      key={status}
                                      onClick={() =>
                                        handleStatusChange(order.id, status)
                                      }
                                      disabled={updatingOrderId === order.id}
                                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
                                        order.status === status
                                          ? "border-slate-900 bg-slate-900 text-white"
                                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:shadow-sm"
                                      }`}
                                    >
                                      {updatingOrderId === order.id
                                        ? "Updating..."
                                        : formatStatus(status)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                    <OrderIcon />
                                  </div>

                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Receiver Details
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                      {order.receiverName ||
                                        order.customer?.name ||
                                        "Receiver name not available"}
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                      {order.receiverPhone ||
                                        order.customer?.phone ||
                                        "Phone number not available"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                                    <LocationIcon />
                                  </div>

                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Delivery Address
                                    </p>

                                    {(order.area || order.city) ? (
                                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                                        {[order.area, order.city]
                                          .filter(Boolean)
                                          .join(", ")}
                                      </p>
                                    ) : null}

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                      {order.address ||
                                        "No address available."}
                                    </p>

                                    {order.deliveryNote ? (
                                      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                          Delivery Note
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                          {order.deliveryNote}
                                        </p>
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                    <PaymentIcon />
                                  </div>

                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Payment Method
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                      {order.paymentMethod ||
                                        "Cash on Delivery"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-[26px] border border-emerald-100 bg-emerald-50 p-5">
                                <p className="text-sm font-semibold text-emerald-800">
                                  Chef-managed local delivery
                                </p>
                                <p className="mt-2 text-sm leading-6 text-emerald-700">
                                  This order should be delivered only within your
                                  nearby service area. Long-distance delivery is
                                  not supported.
                                </p>
                              </div>
                            </div>
                          </div>
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

export default ChefOrdersPage;