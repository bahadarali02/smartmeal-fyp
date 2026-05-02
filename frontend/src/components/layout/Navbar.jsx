import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M6 6h15l-2 9H8L6 2H3"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21h.01M18 21h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M18 9a6 6 0 0 0-12 0v4l-2 3h16l-2-3V9ZM10 20h4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <div className="relative h-5 w-5">
      <span
        className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition-all duration-300 ${
          open ? "translate-y-2 rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-2 h-0.5 w-5 rounded bg-current transition-all duration-300 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 top-4 h-0.5 w-5 rounded bg-current transition-all duration-300 ${
          open ? "-translate-y-2 -rotate-45" : ""
        }`}
      />
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const savedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("smartmealUser")) || null;
  }, [location.pathname]);

  const token = localStorage.getItem("smartmealToken");
  const isLoggedIn = Boolean(token && savedUser);

  const updateCartCount = () => {
    const cartItems = JSON.parse(localStorage.getItem("smartmealCart")) || [];

    const totalQuantity = cartItems.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );

    setCartCount(totalQuantity);
  };

  useEffect(() => {
    updateCartCount();

    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    const intervalId = setInterval(updateCartCount, 800);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("smartmealToken");
    localStorage.removeItem("smartmealUser");
    localStorage.removeItem("smartmealCart");

    setCartCount(0);

    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    if (path === "/meals") {
      return (
        location.pathname === "/meals" ||
        location.pathname.startsWith("/meals/")
      );
    }

    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    const active = isActive(path);

    return `relative rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
      active
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="container-custom flex h-20 items-center justify-between gap-3">
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
              SM
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                SmartMeal
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Homemade food marketplace
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            <Link to="/" className={navLinkClass("/")}>
              Home
            </Link>

            <Link to="/meals" className={navLinkClass("/meals")}>
              Meals
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to={getDashboardPath(savedUser.role)}
                  className={navLinkClass(getDashboardPath(savedUser.role))}
                >
                  Dashboard
                </Link>

                <Link
                  to="/notifications"
                  className={navLinkClass("/notifications")}
                >
                  Notifications
                </Link>

                <Link
                  to="/profile"
                  className={navLinkClass("/profile")}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass("/login")}>
                  Login
                </Link>

                <Link to="/signup" className={navLinkClass("/signup")}>
                  Become a Chef
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/order"
              className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition duration-300 hover:-translate-y-0.5 ${
                isActive("/order")
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-sm"
              }`}
              aria-label="Cart"
            >
              <CartIcon />

              {cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-orange-500 px-1.5 text-[11px] font-semibold text-white shadow-sm">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to="/notifications"
                  className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm sm:inline-flex"
                  aria-label="Notifications"
                >
                  <BellIcon />
                </Link>

                <button
                  onClick={handleLogout}
                  className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 lg:inline-flex"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 lg:inline-flex"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="hidden lg:inline-flex btn-primary"
                >
                  Get Started
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-300 hover:bg-slate-50 lg:hidden"
              aria-label="Toggle Menu"
            >
              <MenuIcon open={mobileMenuOpen} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm transition-all duration-300 lg:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                SmartMeal
              </h2>

              <p className="text-sm text-slate-500">
                Navigation Menu
              </p>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-2 p-5">
            <Link to="/" className={navLinkClass("/")}>
              Home
            </Link>

            <Link to="/meals" className={navLinkClass("/meals")}>
              Meals
            </Link>

            <Link to="/order" className={navLinkClass("/order")}>
              Cart / Orders
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to={getDashboardPath(savedUser.role)}
                  className={navLinkClass(getDashboardPath(savedUser.role))}
                >
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className={navLinkClass("/profile")}
                >
                  Profile
                </Link>

                <Link
                  to="/notifications"
                  className={navLinkClass("/notifications")}
                >
                  Notifications
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn-secondary mt-4 w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={navLinkClass("/login")}
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className={navLinkClass("/signup")}
                >
                  Become a Chef
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;