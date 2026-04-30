import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardTopbar from "../../components/layout/DashboardTopbar";
import {
  getMyFavorites,
  removeFavorite,
} from "../../services/favoriteService";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toFixed(0)}`;
}

function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingMealId, setRemovingMealId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("smartmealToken");
      const savedUser =
        JSON.parse(localStorage.getItem("smartmealUser")) || null;

      if (!token || !savedUser) {
        setErrorMessage("Please login first to view your favorites.");
        setLoading(false);
        return;
      }

      if (savedUser.role !== "customer") {
        setErrorMessage("Only customer accounts can access favorites.");
        setLoading(false);
        return;
      }

      const data = await getMyFavorites(token);
      setFavorites(data.favorites || []);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to fetch favorites."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleAddToCart = (meal) => {
    const existingCart =
      JSON.parse(localStorage.getItem("smartmealCart")) || [];

    const existingItemIndex = existingCart.findIndex(
      (item) => item.mealId === meal.id
    );

    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push({
        mealId: meal.id,
        name: meal.name,
        chef: meal.chef?.name || "Unknown Chef",
        price: Number(meal.price),
        quantity: 1,
        tag: meal.availability ? "Available" : "Unavailable",
      });
    }

    localStorage.setItem("smartmealCart", JSON.stringify(existingCart));
    setSuccessMessage(`${meal.name} added to cart.`);

    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  };

  const handleRemoveFavorite = async (mealId) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token) {
        setErrorMessage("Please login first.");
        return;
      }

      setRemovingMealId(mealId);

      await removeFavorite(mealId, token);
      setSuccessMessage("Meal removed from favorites.");
      await fetchFavorites();

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to remove favorite."
      );
    } finally {
      setRemovingMealId(null);
    }
  };

  const favoriteMeals = useMemo(() => {
    return favorites
      .map((favorite) => favorite.meal)
      .filter((meal) => Boolean(meal));
  }, [favorites]);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role="customer" />

      <div className="flex-1">
        <DashboardTopbar
          title="My Favorites"
          subtitle="Save meals you like, revisit them later, and quickly add them to your cart."
          actionLabel="Browse Meals"
          actionPath="/meals"
        />

        <main className="p-6 sm:p-8">
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Favorite Meals
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                {String(favoriteMeals.length).padStart(2, "0")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Meals saved to your wishlist
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Local Marketplace
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                Nearby
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Save meals from local verified chefs
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Quick Action
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                Cart
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add favorite meals directly to cart
              </p>
            </div>
          </section>

          {successMessage ? (
            <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-emerald-700">
                {successMessage}
              </p>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Loading favorites...
              </p>
            </div>
          ) : null}

          {!loading && errorMessage ? (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
              <p className="text-sm font-medium text-red-700">
                {errorMessage}
              </p>
            </div>
          ) : null}

          {!loading && !errorMessage && favoriteMeals.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">
                No favorites yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Browse meals and save the ones you like.
              </p>
              <Link to="/meals" className="btn-primary mt-5 inline-flex">
                Browse Meals
              </Link>
            </div>
          ) : null}

          {!loading && !errorMessage && favoriteMeals.length > 0 ? (
            <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {favoriteMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="overflow-hidden bg-slate-100">
                    {meal.imageUrl ? (
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center text-sm text-slate-400">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="badge-soft">
                        {meal.availability ? "Available" : "Unavailable"}
                      </span>
                      <span className="text-base font-semibold text-slate-900">
                        {formatCurrency(meal.price)}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-slate-900">
                      {meal.name}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {meal.chef?.name || "Unknown Chef"} •{" "}
                      {meal.chef?.serviceArea || "Local area"}
                    </p>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      {meal.description}
                    </p>

                    <div className="mt-6 grid gap-3">
                      <button
                        onClick={() => handleAddToCart(meal)}
                        className="btn-primary"
                      >
                        Add to Cart
                      </button>

                      <Link
                        to={`/meals/${meal.id}`}
                        className="btn-secondary text-center"
                      >
                        View Meal
                      </Link>

                      <button
                        onClick={() => handleRemoveFavorite(meal.id)}
                        disabled={removingMealId === meal.id}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {removingMealId === meal.id
                          ? "Removing..."
                          : "Remove Favorite"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default CustomerFavoritesPage;