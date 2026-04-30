import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import MealListingPage from "../pages/MealListingPage";
import MealDetailsPage from "../pages/MealDetailsPage";
import OrderPage from "../pages/OrderPage";
import NotificationsPage from "../pages/NotificationsPage";
import ProfileSettingsPage from "../pages/ProfileSettingsPage";

import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import CustomerOrdersPage from "../pages/customer/CustomerOrdersPage";
import CustomerFavoritesPage from "../pages/customer/CustomerFavoritesPage";
import CustomerFollowingPage from "../pages/customer/CustomerFollowingPage";

import ChefDashboardPage from "../pages/chef/ChefDashboardPage";
import ChefMealsPage from "../pages/chef/ChefMealsPage";
import ChefOrdersPage from "../pages/chef/ChefOrdersPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminMealsPage from "../pages/admin/AdminMealsPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";

import ProtectedRoute from "../components/common/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/meals" element={<MealListingPage />} />
      <Route path="/meals/:mealId" element={<MealDetailsPage />} />

      <Route
        path="/order"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <OrderPage />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={["customer", "chef", "admin"]}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["customer", "chef", "admin"]}>
            <ProfileSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/orders"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerOrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/favorites"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerFavoritesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/following"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerFollowingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chef/dashboard"
        element={
          <ProtectedRoute allowedRoles={["chef"]}>
            <ChefDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chef/meals"
        element={
          <ProtectedRoute allowedRoles={["chef"]}>
            <ChefMealsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chef/orders"
        element={
          <ProtectedRoute allowedRoles={["chef"]}>
            <ChefOrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/meals"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminMealsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminOrdersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;