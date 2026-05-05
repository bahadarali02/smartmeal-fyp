import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/common/EmptyState";
import StarRating from "../components/common/StarRating";
import { SkeletonCard } from "../components/common/Skeleton";
import { getAllMeals } from "../services/mealService";
import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from "../services/favoriteService";
import { getFullImageUrl } from "../services/uploadService";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toFixed(0)}`;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon({ filled = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      className="h-5 w-5"
    >
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
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

function SearchFilterBar({
  searchTerm,
  selectedCategory,
  sortOption,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-100/70 blur-3xl" />

      <div className="relative grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="min-w-0">
          <label
            htmlFor="search"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Search meals
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>

            <input
              id="search"
              type="text"
              placeholder="Search by meal name"
              value={searchTerm}
              onChange={onSearchChange}
              className="input-soft pl-12"
            />
          </div>
        </div>

        <div className="min-w-0">
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Filter
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={onCategoryChange}
            className="select-soft"
          >
            <option value="all">All Meals</option>
            <option value="available">Available Only</option>
            <option value="verified">Verified Chefs</option>
          </select>
        </div>

        <div className="min-w-0">
          <label
            htmlFor="sort"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Sort by
          </label>
          <select
            id="sort"
            value={sortOption}
            onChange={onSortChange}
            className="select-soft"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function ImageFallback({ label = "No photo" }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 px-4 text-center text-sm font-semibold text-slate-400">
      {label}
    </div>
  );
}

function MealCard({
  meal,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  favoriteLoadingId,
}) {
  const chefName = meal.chef?.name || "Unknown Chef";
  const isVerifiedChef = meal.chef?.approvalStatus === "approved";
  const isFavoriteLoading = favoriteLoadingId === meal.id;
  const chefInitials = chefName.slice(0, 2).toUpperCase();
  const averageRating = Number(meal.averageRating || 0);
  const reviewCount = Number(meal.reviewCount || 0);

  const [mealImageFailed, setMealImageFailed] = useState(false);
  const [chefImageFailed, setChefImageFailed] = useState(false);

  return (
    <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/80">
      <div className="relative overflow-hidden bg-slate-100">
        {meal.imageUrl && !mealImageFailed ? (
          <img
            src={getFullImageUrl(meal.imageUrl)}
            alt={meal.name}
            loading="lazy"
            onError={() => setMealImageFailed(true)}
            className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="aspect-[4/3] w-full">
            <ImageFallback label="No meal photo" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/55 to-transparent" />

        <div className="absolute left-3 top-3 flex max-w-[calc(100%-72px)] flex-wrap gap-2 sm:left-4 sm:top-4">
          <span
            className={meal.availability ? "badge-success" : "badge-danger"}
          >
            {meal.availability ? "Available" : "Unavailable"}
          </span>

          {isVerifiedChef ? (
            <span className="rounded-full border border-white/40 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
              ✓ Verified
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onToggleFavorite(meal.id)}
          disabled={isFavoriteLoading}
          className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 sm:right-4 sm:top-4 ${
            isFavorite
              ? "border-red-200 bg-red-50/95 text-red-600"
              : "border-white/50 bg-white/90 text-slate-700 hover:text-red-600"
          }`}
          aria-label={isFavorite ? "Remove favorite" : "Save favorite"}
        >
          <HeartIcon filled={isFavorite} />
        </button>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/80">Homemade meal</p>
            <h3 className="mt-1 line-clamp-2 break-words text-lg font-semibold leading-tight text-white sm:text-xl">
              {meal.name}
            </h3>
          </div>

          <span className="shrink-0 rounded-2xl bg-white/95 px-3 py-2 text-sm font-bold text-slate-900 shadow-sm backdrop-blur">
            {formatCurrency(meal.price)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-xs font-semibold text-slate-500 shadow-sm">
            {meal.chef?.profileImageUrl && !chefImageFailed ? (
              <img
                src={getFullImageUrl(meal.chef.profileImageUrl)}
                alt={chefName}
                loading="lazy"
                onError={() => setChefImageFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              chefInitials
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {chefName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {meal.chef?.specialty || "Homemade food specialist"}
            </p>
          </div>

          <div className="shrink-0 rounded-full bg-white px-3 py-1 shadow-sm">
            <StarRating
              rating={averageRating}
              count={reviewCount}
              showValue={true}
              showCount={false}
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
          <StarRating
            rating={averageRating}
            count={reviewCount}
            showValue={true}
            showCount={true}
          />
        </div>

        <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-500">
          {meal.description}
        </p>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-start gap-2 text-slate-500">
            <span className="mt-0.5 shrink-0 text-orange-500">
              <LocationIcon />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700">
                Nearby delivery only
              </p>
              <p className="mt-1 break-words text-sm text-slate-500">
                Service area: {meal.chef?.serviceArea || "Local area only"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => onAddToCart(meal)} className="btn-primary">
              Add to Cart
            </button>

            <Link to={`/meals/${meal.id}`} className="btn-secondary text-center">
              View Meal
            </Link>
          </div>

          <button
            onClick={() => onToggleFavorite(meal.id)}
            disabled={isFavoriteLoading}
            className={`mt-3 min-h-[48px] w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
              isFavorite
                ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:shadow-sm"
            }`}
          >
            {isFavoriteLoading
              ? "Updating..."
              : isFavorite
              ? "Remove from Favorites"
              : "Save to Favorites"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MealListingPage() {
  const [meals, setMeals] = useState([]);
  const [favoriteMealIds, setFavoriteMealIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [favoriteWarning, setFavoriteWarning] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  const savedUser = JSON.parse(localStorage.getItem("smartmealUser")) || null;
  const isCustomer = savedUser?.role === "customer";

  useEffect(() => {
    const fetchMealsAndFavorites = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setFavoriteWarning("");

        const mealData = await getAllMeals();
        setMeals(mealData.meals || []);
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          "Failed to fetch meals. Please try again.";

        setErrorMessage(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }

      try {
        const token = localStorage.getItem("smartmealToken");
        const user = JSON.parse(localStorage.getItem("smartmealUser")) || null;

        if (token && user?.role === "customer") {
          const favoriteData = await getMyFavorites(token);
          const ids = (favoriteData.favorites || [])
            .map((favorite) => favorite.meal?.id)
            .filter(Boolean);

          setFavoriteMealIds(ids);
        }
      } catch (error) {
        const message =
          "Meals loaded, but favorites could not be synced right now.";

        setFavoriteWarning(message);
        toast.error(message);
      }
    };

    fetchMealsAndFavorites();
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
    toast.success(`${meal.name} added to cart.`);

    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  };

  const handleToggleFavorite = async (mealId) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setFavoriteWarning("");

      const token = localStorage.getItem("smartmealToken");
      const user = JSON.parse(localStorage.getItem("smartmealUser")) || null;

      if (!token || !user) {
        const message = "Please login as a customer to save favorites.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      if (user.role !== "customer") {
        const message = "Only customer accounts can save favorite meals.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      setFavoriteLoadingId(mealId);

      if (favoriteMealIds.includes(mealId)) {
        await removeFavorite(mealId, token);
        setFavoriteMealIds((previousIds) =>
          previousIds.filter((id) => id !== mealId)
        );
        setSuccessMessage("Meal removed from favorites.");
        toast.success("Meal removed from favorites.");
      } else {
        await addFavorite(mealId, token);
        setFavoriteMealIds((previousIds) => [...previousIds, mealId]);
        setSuccessMessage("Meal saved to favorites.");
        toast.success("Meal saved to favorites.");
      }

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to update favorites. Please try again.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  const filteredMeals = useMemo(() => {
    let filtered = [...meals];

    if (searchTerm.trim()) {
      filtered = filtered.filter((meal) =>
        meal.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory === "available") {
      filtered = filtered.filter((meal) => meal.availability === true);
    }

    if (selectedCategory === "verified") {
      filtered = filtered.filter(
        (meal) => meal.chef?.approvalStatus === "approved"
      );
    }

    if (sortOption === "price-low") {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === "price-high") {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortOption === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filtered.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return filtered;
  }, [meals, searchTerm, selectedCategory, sortOption]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-14 sm:py-16">
        <div className="absolute inset-0 hero-grid-bg opacity-60" />
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-16 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="container-custom relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-soft">Local homemade marketplace</span>

            <div className="mt-5">
              <SectionHeader
                title="Browse Homemade Meals"
                subtitle="Explore approved homemade meals from verified local home chefs, compare prices in PKR, and order within your nearby area."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="container-custom">
          <div className="relative mb-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-5">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-100/70 blur-3xl" />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  SmartMeal is a local marketplace
                </p>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  Public listings only show meals approved by admin. Customers
                  can save favorite meals and order from nearby home chefs.
                </p>
              </div>

              {isCustomer ? (
                <Link
                  to="/customer/favorites"
                  className="btn-secondary w-full sm:w-fit"
                >
                  View My Favorites
                </Link>
              ) : (
                <Link to="/login" className="btn-secondary w-full sm:w-fit">
                  Login to Save Favorites
                </Link>
              )}
            </div>
          </div>

          <SearchFilterBar
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            sortOption={sortOption}
            onSearchChange={(event) => setSearchTerm(event.target.value)}
            onCategoryChange={(event) => setSelectedCategory(event.target.value)}
            onSortChange={(event) => setSortOption(event.target.value)}
          />

          {successMessage ? (
            <div className="mt-6 rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-emerald-700">
                {successMessage}
              </p>
            </div>
          ) : null}

          {favoriteWarning ? (
            <div className="mt-6 rounded-[28px] border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-amber-700">
                {favoriteWarning}
              </p>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : null}

          {!loading && errorMessage ? (
            <div className="mt-10 rounded-[30px] border border-red-200 bg-red-50 p-6 text-center shadow-sm sm:p-8">
              <p className="text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            </div>
          ) : null}

          {!loading && !errorMessage && filteredMeals.length === 0 ? (
            <EmptyState
              type="meals"
              title="No meals found"
              message="Approved meals from local chefs will appear here. Try changing your search or filter."
              actionLabel="Reset filters"
              actionPath="/meals"
              className="mt-10"
            />
          ) : null}

          {!loading && !errorMessage && filteredMeals.length > 0 ? (
            <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favoriteMealIds.includes(meal.id)}
                  favoriteLoadingId={favoriteLoadingId}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default MealListingPage;