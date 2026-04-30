import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getFullImageUrl } from "../../services/uploadService";

function DashboardIcon({ type }) {
  const common = "h-5 w-5";

  const icons = {
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M4 5h7v7H4V5ZM13 5h7v4h-7V5ZM13 11h7v8h-7v-8ZM4 14h7v5H4v-5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
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
    notifications: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M18 9a6 6 0 0 0-12 0v4l-2 3h16l-2-3V9ZM10 20h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    cart: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M6 6h15l-2 9H8L6 2H3M9 21h.01M18 21h.01"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    profile: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
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
  };

  return icons[type] || icons.dashboard;
}

function DashboardSidebar({ role = "customer" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const savedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("smartmealUser")) || null;
  }, []);

  const profileImageSrc = savedUser?.profileImageUrl
    ? getFullImageUrl(savedUser.profileImageUrl)
    : "";

  const navItems = {
    customer: [
      { name: "Dashboard", path: "/customer/dashboard", icon: "dashboard" },
      { name: "Browse Meals", path: "/meals", icon: "meals" },
      { name: "My Orders", path: "/customer/orders", icon: "orders" },
      { name: "Favorites", path: "/customer/favorites", icon: "favorites" },
      { name: "Following", path: "/customer/following", icon: "following" },
      {
        name: "Notifications",
        path: "/notifications",
        icon: "notifications",
      },
      { name: "Cart", path: "/order", icon: "cart" },
      { name: "Profile Settings", path: "/profile", icon: "profile" },
    ],
    chef: [
      { name: "Dashboard", path: "/chef/dashboard", icon: "dashboard" },
      { name: "My Meals", path: "/chef/meals", icon: "meals" },
      { name: "Orders", path: "/chef/orders", icon: "orders" },
      {
        name: "Notifications",
        path: "/notifications",
        icon: "notifications",
      },
      { name: "Profile Settings", path: "/profile", icon: "profile" },
    ],
    admin: [
      { name: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },
      { name: "Users", path: "/admin/users", icon: "users" },
      { name: "Meals", path: "/admin/meals", icon: "meals" },
      { name: "Orders", path: "/admin/orders", icon: "orders" },
      {
        name: "Notifications",
        path: "/notifications",
        icon: "notifications",
      },
      { name: "Profile Settings", path: "/profile", icon: "profile" },
    ],
  };

  const currentItems = navItems[role] || navItems.customer;

  const handleLogout = () => {
    localStorage.removeItem("smartmealToken");
    localStorage.removeItem("smartmealUser");
    localStorage.removeItem("smartmealCart");
    navigate("/login");
  };

  const isActiveLink = (path) => {
    if (path === "/meals") {
      return (
        location.pathname === "/meals" ||
        location.pathname.startsWith("/meals/")
      );
    }

    return location.pathname === path;
  };

  return (
    <aside className="w-full border-b border-slate-200 bg-white/90 backdrop-blur-xl lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-5 py-6">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
              SM
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                SmartMeal
              </h1>
              <p className="text-xs text-slate-500 capitalize">
                {role} workspace
              </p>
            </div>
          </Link>
        </div>

        <div className="px-5 py-5">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white text-sm font-semibold text-slate-500 shadow-sm">
                {profileImageSrc ? (
                  <img
                    src={profileImageSrc}
                    alt={savedUser?.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (savedUser?.name || "SM").slice(0, 2).toUpperCase()
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {savedUser?.name || "SmartMeal User"}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {savedUser?.email || "No email available"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm">
                {savedUser?.role || role}
              </span>

              {role === "chef" && savedUser?.approvalStatus ? (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    savedUser.approvalStatus === "approved"
                      ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                      : savedUser.approvalStatus === "rejected"
                      ? "border border-red-100 bg-red-50 text-red-700"
                      : "border border-amber-100 bg-amber-50 text-amber-700"
                  }`}
                >
                  {savedUser.approvalStatus}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="px-4 pb-6">
          <p className="px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Navigation
          </p>

          <nav className="mt-4 flex flex-col gap-2">
            {currentItems.map((item) => {
              const active = isActiveLink(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-300 ${
                    active
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition duration-300 ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-white text-slate-500 shadow-sm group-hover:text-slate-900"
                    }`}
                  >
                    <DashboardIcon type={item.icon} />
                  </span>

                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-100/70 blur-2xl" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                SmartMeal
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Local homemade food ordering with clean dashboards.
              </p>

              <button
                onClick={handleLogout}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 hover:shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default DashboardSidebar;