import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SectionHeader from "../components/common/SectionHeader";
import { createOrder } from "../services/orderService";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toFixed(0)}`;
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M6 6h15l-2 9H8L6 2H3M9 21h.01M18 21h.01"
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

function OrderPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const savedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("smartmealUser")) || null;
  }, []);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("smartmealCart")) || [];
    setCartItems(savedCart);

    if (savedUser?.name) {
      setReceiverName(savedUser.name);
    }

    if (savedUser?.phone) {
      setReceiverPhone(savedUser.phone);
    }

    if (savedUser?.address) {
      setAddress(savedUser.address);
    }

    if (savedUser?.serviceArea) {
      setArea(savedUser.serviceArea);
    }
  }, [savedUser]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);
  }, [cartItems]);

  const deliveryFee = cartItems.length > 0 ? 0 : 0;
  const total = subtotal + deliveryFee;

  const updateCart = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("smartmealCart", JSON.stringify(updatedCart));
  };

  const handleIncreaseQuantity = (mealId) => {
    const updatedCart = cartItems.map((item) => {
      if (item.mealId === mealId) {
        return {
          ...item,
          quantity: Number(item.quantity || 0) + 1,
        };
      }

      return item;
    });

    updateCart(updatedCart);
  };

  const handleDecreaseQuantity = (mealId) => {
    const updatedCart = cartItems
      .map((item) => {
        if (item.mealId === mealId) {
          return {
            ...item,
            quantity: Math.max(Number(item.quantity || 0) - 1, 0),
          };
        }

        return item;
      })
      .filter((item) => Number(item.quantity || 0) > 0);

    updateCart(updatedCart);
  };

  const handleRemoveItem = (mealId) => {
    const updatedCart = cartItems.filter((item) => item.mealId !== mealId);
    updateCart(updatedCart);
  };

  const handleClearCart = () => {
    updateCart([]);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    try {
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");
      const user = JSON.parse(localStorage.getItem("smartmealUser")) || null;

      if (!token || !user) {
        setErrorMessage("Please login as a customer before placing an order.");
        return;
      }

      if (user.role !== "customer") {
        setErrorMessage("Only customer accounts can place orders.");
        return;
      }

      if (cartItems.length === 0) {
        setErrorMessage("Your cart is empty.");
        return;
      }

      if (!receiverName.trim()) {
        setErrorMessage("Receiver name is required.");
        return;
      }

      if (!receiverPhone.trim()) {
        setErrorMessage("Receiver phone number is required.");
        return;
      }

      if (!city.trim()) {
        setErrorMessage("City is required.");
        return;
      }

      if (!area.trim()) {
        setErrorMessage("Area / locality is required.");
        return;
      }

      if (!address.trim()) {
        setErrorMessage("Full delivery address is required.");
        return;
      }

      setPlacingOrder(true);

      const payload = {
        items: cartItems.map((item) => ({
          mealId: item.mealId,
          quantity: Number(item.quantity || 1),
        })),
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        city: city.trim(),
        area: area.trim(),
        address: address.trim(),
        deliveryNote: deliveryNote.trim(),
        paymentMethod,
      };

      const data = await createOrder(payload, token);

      localStorage.removeItem("smartmealCart");
      setCartItems([]);
      setSuccessMessage(data.message || "Order placed successfully.");

      setTimeout(() => {
        navigate("/customer/orders");
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16">
        <div className="absolute inset-0 hero-grid-bg opacity-60" />
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl" />
        <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="container-custom relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-soft">Checkout</span>

            <div className="mt-5">
              <SectionHeader
                title="Your SmartMeal Cart"
                subtitle="Review your homemade meals, confirm receiver details, add your city and area, and place your local delivery order."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-custom">
          {successMessage ? (
            <div className="mb-6 rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-emerald-700">
                {successMessage}
              </p>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mb-6 rounded-[28px] border border-red-200 bg-red-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            </div>
          ) : null}

          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <CartIcon />
              </div>

              <p className="mt-5 text-xl font-semibold text-slate-900">
                Your cart is empty
              </p>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Browse approved homemade meals from nearby chefs and add your
                favorite meals to cart.
              </p>

              <Link to="/meals" className="btn-primary mt-6">
                Browse Meals
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
                <div className="table-shell">
                  <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Cart Items
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Review meals before placing your order.
                      </p>
                    </div>

                    <button
                      onClick={handleClearCart}
                      className="btn-secondary w-fit"
                    >
                      Clear Cart
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {cartItems.map((item) => {
                      const itemTotal =
                        Number(item.price || 0) * Number(item.quantity || 0);

                      return (
                        <div
                          key={item.mealId}
                          className="grid gap-5 px-6 py-5 transition hover:bg-slate-50 lg:grid-cols-[1fr_auto] lg:items-center"
                        >
                          <div>
                            <div className="flex items-start gap-4">
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-slate-100 text-sm font-semibold text-slate-500 shadow-sm">
                                Meal
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-base font-semibold text-slate-900">
                                  {item.name}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {item.chef || "Local Chef"} •{" "}
                                  {item.tag || "Available"}
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                  {formatCurrency(item.price)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <div className="flex w-fit items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                              <button
                                onClick={() =>
                                  handleDecreaseQuantity(item.mealId)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                              >
                                −
                              </button>

                              <span className="flex h-9 min-w-10 items-center justify-center px-2 text-sm font-semibold text-slate-900">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  handleIncreaseQuantity(item.mealId)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900">
                                {formatCurrency(itemTotal)}
                              </p>

                              <button
                                onClick={() => handleRemoveItem(item.mealId)}
                                className="mt-1 text-xs font-semibold text-red-600 transition hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="panel-soft relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100/70 blur-3xl" />

                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                      <LocationIcon />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Local Delivery Reminder
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-slate-500">
                        SmartMeal is designed for nearby homemade food delivery.
                        Please order only from chefs serving your local area or
                        city. Long-distance delivery is not supported.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="panel-soft">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Receiver Details
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Add the person and phone number for this local delivery.
                  </p>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="receiverName"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Receiver Name
                      </label>

                      <input
                        id="receiverName"
                        type="text"
                        value={receiverName}
                        onChange={(event) =>
                          setReceiverName(event.target.value)
                        }
                        placeholder="Full name"
                        className="input-soft"
                        disabled={placingOrder}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="receiverPhone"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Phone Number
                      </label>

                      <input
                        id="receiverPhone"
                        type="text"
                        value={receiverPhone}
                        onChange={(event) =>
                          setReceiverPhone(event.target.value)
                        }
                        placeholder="03xx xxxxxxx"
                        className="input-soft"
                        disabled={placingOrder}
                      />
                    </div>
                  </div>
                </div>

                <div className="panel-soft">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Delivery Location
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Add exact city, area, and address so the chef can confirm
                    local delivery.
                  </p>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="city"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        City
                      </label>

                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder="Example: Khanewal"
                        className="input-soft"
                        disabled={placingOrder}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="area"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Area / Locality
                      </label>

                      <input
                        id="area"
                        type="text"
                        value={area}
                        onChange={(event) => setArea(event.target.value)}
                        placeholder="Example: Talamba, Multan Road"
                        className="input-soft"
                        disabled={placingOrder}
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="address"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Full Delivery Address
                    </label>

                    <textarea
                      id="address"
                      rows="4"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="House number, street, nearby landmark, exact delivery details"
                      className="textarea-soft"
                      disabled={placingOrder}
                    />
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="deliveryNote"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Delivery Note Optional
                    </label>

                    <textarea
                      id="deliveryNote"
                      rows="3"
                      value={deliveryNote}
                      onChange={(event) =>
                        setDeliveryNote(event.target.value)
                      }
                      placeholder="Example: Call before delivery, gate color, nearby landmark..."
                      className="textarea-soft"
                      disabled={placingOrder}
                    />
                  </div>
                </div>

                <div className="panel-soft">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <PaymentIcon />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Payment Method
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        SmartMeal currently supports Cash on Delivery for local
                        orders.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white hover:shadow-sm">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash on Delivery"
                        checked={paymentMethod === "Cash on Delivery"}
                        onChange={(event) =>
                          setPaymentMethod(event.target.value)
                        }
                        disabled={placingOrder}
                        className="h-4 w-4 accent-slate-900"
                      />

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Cash on Delivery
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Pay the home chef when your order is delivered.
                        </p>
                      </div>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white hover:shadow-sm">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Simulated Payment"
                        checked={paymentMethod === "Simulated Payment"}
                        onChange={(event) =>
                          setPaymentMethod(event.target.value)
                        }
                        disabled={placingOrder}
                        className="h-4 w-4 accent-slate-900"
                      />

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Simulated Payment
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Demo-only payment option for project presentation.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="panel-soft sticky top-24">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Order Summary
                  </h3>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Delivery Fee</span>
                      <span className="font-semibold text-emerald-700">
                        Chef-managed
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-slate-900">
                          Total
                        </span>
                        <span className="text-2xl font-semibold text-slate-900">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={placingOrder}
                    className="btn-primary mt-6 w-full"
                  >
                    {placingOrder ? "Placing Order..." : "Place Order"}
                  </button>

                  <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                    By placing this order, you confirm the delivery address is
                    within the chef’s nearby service area.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default OrderPage;