import React from "react";
import { Navigate } from "react-router-dom";

function getDefaultRouteByRole(role) {
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

function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("smartmealToken");
  const savedUser = JSON.parse(localStorage.getItem("smartmealUser")) || null;

  if (!token || !savedUser) {
    return <Navigate to="/login" replace />;
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(savedUser.role)
  ) {
    return <Navigate to={getDefaultRouteByRole(savedUser.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;