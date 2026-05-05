import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import StarRating from "../components/common/StarRating";
import { getMealById } from "../services/mealService";
import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from "../services/favoriteService";
import {
  followChef,
  getMyFollowing,
  unfollowChef,
} from "../services/followService";
import { createReview, getMealReviews } from "../services/reviewService";
import { getFullImageUrl } from "../services/uploadService";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toFixed(0)}`;
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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReviewUserIcon() {
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

function MealDetailsPage() {
  const { mealId } = useParams();

  const [meal, setMeal] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowingChef, setIsFollowingChef] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);

      const data = await getMealReviews(mealId);

      setReviews(data.reviews || []);
      setAverageRating(Number(data.averageRating || 0));
      setReviewCount(Number(data.count || 0));
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to fetch meal reviews. Please try again.";

      toast.error(message);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getMealById(mealId);
        const fetchedMeal = data.meal || null;

        setMeal(fetchedMeal);

        const token = localStorage.getItem("smartmealToken");
        const savedUser =
          JSON.parse(localStorage.getItem("smartmealUser")) || null;

        if (token && savedUser?.role === "customer") {
          const favoriteData = await getMyFavorites(token);
          const favoriteIds = (favoriteData.favorites || [])
            .map((favorite) => favorite.meal?.id)
            .filter(Boolean);

          setIsFavorite(favoriteIds.includes(Number(mealId)));

          const followingData = await getMyFollowing(token);
          const followingChefIds = (followingData.following || [])
            .map((follow) => follow.chef?.id)
            .filter(Boolean);

          if (fetchedMeal?.chef?.id) {
            setIsFollowingChef(followingChefIds.includes(fetchedMeal.chef.id));
          }
        }

        await fetchReviews();
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message ||
            "Failed to fetch meal details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [mealId]);

  const handleAddToCart = () => {
    if (!meal) {
      return;
    }

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

  const handleToggleFavorite = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");
      const savedUser =
        JSON.parse(localStorage.getItem("smartmealUser")) || null;

      if (!token || !savedUser) {
        const message = "Please login as a customer to save favorites.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      if (savedUser.role !== "customer") {
        const message = "Only customer accounts can save favorite meals.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      setFavoriteLoading(true);

      if (isFavorite) {
        await removeFavorite(meal.id, token);
        setIsFavorite(false);
        setSuccessMessage("Meal removed from favorites.");
        toast.success("Meal removed from favorites.");
      } else {
        await addFavorite(meal.id, token);
        setIsFavorite(true);
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
      setFavoriteLoading(false);
    }
  };

  const handleToggleFollowChef = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");
      const savedUser =
        JSON.parse(localStorage.getItem("smartmealUser")) || null;

      if (!token || !savedUser) {
        const message = "Please login as a customer to follow chefs.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      if (savedUser.role !== "customer") {
        const message = "Only customer accounts can follow chefs.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      if (!meal?.chef?.id) {
        const message = "Chef information is not available.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      setFollowLoading(true);

      if (isFollowingChef) {
        await unfollowChef(meal.chef.id, token);
        setIsFollowingChef(false);
        setSuccessMessage("Chef unfollowed successfully.");
        toast.success("Chef unfollowed successfully.");
      } else {
        await followChef(meal.chef.id, token);
        setIsFollowingChef(true);
        setSuccessMessage("Chef followed successfully.");
        toast.success("Chef followed successfully.");
      }

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to update following status. Please try again.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");
      const savedUser =
        JSON.parse(localStorage.getItem("smartmealUser")) || null;

      if (!token || !savedUser) {
        const message = "Please login as a customer to review this meal.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      if (savedUser.role !== "customer") {
        const message = "Only customer accounts can review meals.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      if (!reviewRating) {
        const message = "Please select a star rating before submitting.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      if (!reviewText.trim()) {
        const message = "Please write a short review before submitting.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      setReviewLoading(true);

      await createReview(
        meal.id,
        {
          rating: reviewRating,
          comment: reviewText.trim(),
        },
        token
      );

      await fetchReviews();

      setReviewRating(0);
      setReviewText("");
      setSuccessMessage("Review submitted successfully.");
      toast.success("Review submitted successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to submit review. Please try again.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setReviewLoading(false);
    }
  };

  const isVerifiedChef = meal?.chef?.approvalStatus === "approved";
  const chefName = meal?.chef?.name || "Unknown Chef";
  const chefInitials = chefName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-12">
        <div className="absolute inset-0 hero-grid-bg opacity-60" />
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl" />
        <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="container-custom relative">
          <Link
            to="/meals"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
          >
            ← Back to meals
          </Link>

          <div className="mt-7 max-w-3xl">
            <span className="badge-soft">Meal Details</span>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {meal?.name || "Meal"}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              View approved meal details, chef information, local service area,
              favorites, following, and ordering options.
            </p>
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

          {loading ? (
            <div className="loading-shell">
              <p className="text-sm font-semibold text-slate-500">
                Loading meal details...
              </p>
            </div>
          ) : null}

          {!loading && errorMessage ? (
            <div className="rounded-[30px] border border-red-200 bg-red-50 p-8 shadow-sm">
              <p className="text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            </div>
          ) : null}

          {!loading && !errorMessage && meal ? (
            <div className="space-y-8">
              <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-8">
                  <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
                    <div className="relative overflow-hidden bg-slate-100">
                      {meal.imageUrl ? (
                        <img
                          src={getFullImageUrl(meal.imageUrl)}
                          alt={meal.name}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 text-sm text-slate-400">
                          No meal photo
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/60 to-transparent" />

                      <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                        <span
                          className={
                            meal.availability ? "badge-success" : "badge-danger"
                          }
                        >
                          {meal.availability ? "Available" : "Unavailable"}
                        </span>

                        {isVerifiedChef ? (
                          <span className="rounded-full border border-white/40 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
                            ✓ Verified Chef
                          </span>
                        ) : null}
                      </div>

                      <button
                        onClick={handleToggleFavorite}
                        disabled={favoriteLoading}
                        className={`absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
                          isFavorite
                            ? "border-red-200 bg-red-50/95 text-red-600"
                            : "border-white/50 bg-white/90 text-slate-700 hover:text-red-600"
                        }`}
                        aria-label={
                          isFavorite ? "Remove favorite" : "Save favorite"
                        }
                      >
                        <HeartIcon filled={isFavorite} />
                      </button>

                      <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-white/80">
                            Homemade meal
                          </p>
                          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">
                            {meal.name}
                          </h2>
                        </div>

                        <span className="w-fit rounded-2xl bg-white/95 px-4 py-3 text-lg font-bold text-slate-900 shadow-sm backdrop-blur">
                          {formatCurrency(meal.price)}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="flex flex-wrap gap-3">
                        <span className="badge-soft">Fresh homemade food</span>
                        <span className="badge-soft">
                          Chef-managed delivery
                        </span>
                        <span className="badge-soft">Local marketplace</span>
                      </div>

                      <p className="mt-6 text-sm leading-8 text-slate-600">
                        {meal.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="panel-soft">
                    <p className="text-sm font-medium text-slate-500">Price</p>

                    <h3 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
                      {formatCurrency(meal.price)}
                    </h3>

                    <div className="mt-4 rounded-[24px] border border-amber-100 bg-amber-50 p-4">
                      <StarRating
                        rating={averageRating}
                        count={reviewCount}
                        showValue={true}
                        showCount={true}
                      />
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Clear PKR pricing for local homemade food ordering.
                    </p>

                    <div className="mt-6 grid gap-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          onClick={handleAddToCart}
                          className="btn-primary"
                        >
                          Add to Cart
                        </button>

                        <Link
                          to="/order"
                          className="btn-secondary text-center"
                        >
                          Go to Cart
                        </Link>
                      </div>

                      <button
                        onClick={handleToggleFavorite}
                        disabled={favoriteLoading}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
                          isFavorite
                            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        {favoriteLoading
                          ? "Updating..."
                          : isFavorite
                          ? "Remove from Favorites"
                          : "Save to Favorites"}
                      </button>
                    </div>
                  </div>

                  <div className="panel-soft">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          Chef Information
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Local home chef preparing this meal.
                        </p>
                      </div>

                      {isVerifiedChef ? (
                        <span className="badge-success">Verified</span>
                      ) : null}
                    </div>

                    <div className="mt-6 flex items-center gap-4 rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white text-sm font-semibold text-slate-500 shadow-sm">
                        {meal.chef?.profileImageUrl ? (
                          <img
                            src={getFullImageUrl(meal.chef.profileImageUrl)}
                            alt={chefName}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          chefInitials
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {chefName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {meal.chef?.specialty || "Homemade food specialist"}
                        </p>
                        <div className="mt-2">
                          <StarRating
                            rating={averageRating}
                            count={reviewCount}
                            showValue={true}
                            showCount={false}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 text-orange-500">
                          <LocationIcon />
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Service Area
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {meal.chef?.serviceArea ||
                              "Nearby local area only"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleToggleFollowChef}
                      disabled={followLoading}
                      className={`mt-5 w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
                        isFollowingChef
                          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      {followLoading
                        ? "Updating..."
                        : isFollowingChef
                        ? "Unfollow Chef"
                        : "Follow Chef"}
                    </button>

                    <Link
                      to="/customer/following"
                      className="btn-secondary mt-3 w-full text-center"
                    >
                      View Following List
                    </Link>
                  </div>

                  <div className="panel-soft relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-100/70 blur-3xl" />

                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <ShieldIcon />
                      </div>

                      <h3 className="mt-5 text-xl font-semibold text-slate-900">
                        Local Delivery Note
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-slate-500">
                        SmartMeal is designed for local homemade food delivery.
                        Please order from chefs serving your nearby area or same
                        city. Long-distance delivery is not supported.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel-soft">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="badge-soft w-fit">Customer feedback</p>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                      Reviews & Ratings
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      Read customer feedback and share your own experience after
                      trying this homemade meal. Reviews appear at the end of
                      the meal details so ordering and chef information stay easy
                      to access first.
                    </p>
                  </div>

                  <div className="w-full rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm lg:w-auto lg:min-w-[240px]">
                    <div className="flex items-center justify-between gap-4 lg:block">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                          Average Rating
                        </p>
                        <p className="mt-2 text-4xl font-semibold tracking-tight text-amber-950">
                          {Number(averageRating || 0).toFixed(1)}
                        </p>
                      </div>

                      <div className="lg:mt-3">
                        <StarRating
                          rating={averageRating}
                          count={reviewCount}
                          showValue={false}
                          showCount={false}
                          size="lg"
                        />
                        <p className="mt-2 text-sm font-semibold text-amber-800">
                          {reviewCount} review
                          {reviewCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                  <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-100/70 blur-3xl" />

                    <div className="relative">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">
                            Write a Review
                          </h4>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Rate this meal from 1 to 5 stars and write a short
                            comment for other customers.
                          </p>
                        </div>

                        <span className="badge-soft w-fit">Customer only</span>
                      </div>

                      <div className="mt-6 rounded-[26px] border border-amber-100 bg-amber-50/70 p-4">
                        <p className="text-sm font-semibold text-slate-800">
                          Your rating
                        </p>

                        <div className="mt-3">
                          <StarRating
                            rating={reviewRating}
                            size="lg"
                            showValue={true}
                            showCount={false}
                            interactive={true}
                            onChange={setReviewRating}
                          />
                        </div>
                      </div>

                      <div className="mt-5">
                        <label
                          htmlFor="reviewText"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Your review
                        </label>

                        <textarea
                          id="reviewText"
                          value={reviewText}
                          onChange={(event) =>
                            setReviewText(event.target.value)
                          }
                          rows={5}
                          placeholder="Share taste, packaging, freshness, and delivery experience..."
                          className="textarea-soft mt-2 resize-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSubmitReview}
                        disabled={reviewLoading}
                        className="btn-primary mt-5 w-full"
                      >
                        {reviewLoading
                          ? "Submitting Review..."
                          : "Submit Review"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reviewsLoading ? (
                      <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <p className="text-sm font-semibold text-slate-500">
                          Loading reviews...
                        </p>
                      </div>
                    ) : null}

                    {!reviewsLoading && reviews.length === 0 ? (
                      <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                          <ReviewUserIcon />
                        </div>

                        <p className="mt-4 text-lg font-semibold text-slate-900">
                          No reviews yet
                        </p>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                          Be the first customer to review this homemade meal.
                        </p>
                      </div>
                    ) : null}

                    {!reviewsLoading
                      ? reviews.map((review) => (
                          <div
                            key={review.id}
                            className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600 shadow-sm">
                                  {review.customer?.profileImageUrl ? (
                                    <img
                                      src={getFullImageUrl(
                                        review.customer.profileImageUrl
                                      )}
                                      alt={
                                        review.customer?.name ||
                                        "SmartMeal Customer"
                                      }
                                      loading="lazy"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    (review.customer?.name || "SM")
                                      .slice(0, 2)
                                      .toUpperCase()
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="break-words text-sm font-semibold text-slate-900">
                                    {review.customer?.name ||
                                      "SmartMeal Customer"}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {review.createdAt
                                      ? new Date(
                                          review.createdAt
                                        ).toLocaleDateString("en-PK", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })
                                      : "Recently"}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 rounded-full border border-amber-100 bg-amber-50 px-3 py-2">
                                <StarRating
                                  rating={review.rating}
                                  showValue={false}
                                  showCount={false}
                                />
                              </div>
                            </div>

                            <p className="mt-4 break-words rounded-[22px] bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                              {review.comment || "No written comment."}
                            </p>
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default MealDetailsPage;