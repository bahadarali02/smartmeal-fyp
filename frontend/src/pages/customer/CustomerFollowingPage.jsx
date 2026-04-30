import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardTopbar from "../../components/layout/DashboardTopbar";
import {
  getMyFollowing,
  unfollowChef,
} from "../../services/followService";
import { getFullImageUrl } from "../../services/uploadService";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toFixed(0)}`;
}

function CustomerFollowingPage() {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfollowLoadingId, setUnfollowLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("smartmealToken");
      const savedUser =
        JSON.parse(localStorage.getItem("smartmealUser")) || null;

      if (!token || !savedUser) {
        setErrorMessage("Please login first to view followed chefs.");
        setLoading(false);
        return;
      }

      if (savedUser.role !== "customer") {
        setErrorMessage("Only customer accounts can follow chefs.");
        setLoading(false);
        return;
      }

      const data = await getMyFollowing(token);
      setFollowing(data.following || []);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to fetch followed chefs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, []);

  const followedChefs = useMemo(() => {
    return following
      .map((follow) => follow.chef)
      .filter((chef) => Boolean(chef));
  }, [following]);

  const totalMealsFromFollowedChefs = useMemo(() => {
    return followedChefs.reduce((total, chef) => {
      return total + Number(chef.meals?.length || 0);
    }, 0);
  }, [followedChefs]);

  const handleUnfollowChef = async (chefId) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token) {
        setErrorMessage("Please login first.");
        return;
      }

      setUnfollowLoadingId(chefId);

      await unfollowChef(chefId, token);
      setSuccessMessage("Chef unfollowed successfully.");
      await fetchFollowing();

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to unfollow chef."
      );
    } finally {
      setUnfollowLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role="customer" />

      <div className="flex-1">
        <DashboardTopbar
          title="Following"
          subtitle="Keep track of verified local chefs you trust and quickly view their approved meals."
          actionLabel="Browse Meals"
          actionPath="/meals"
        />

        <main className="p-6 sm:p-8">
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Followed Chefs
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                {String(followedChefs.length).padStart(2, "0")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Local chefs saved to your following list
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Available Meals
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                {String(totalMealsFromFollowedChefs).padStart(2, "0")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Approved meals from followed chefs
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Delivery Scope
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                Local
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Follow chefs serving nearby areas
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
                Loading followed chefs...
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

          {!loading && !errorMessage && followedChefs.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">
                You are not following any chefs yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Open a meal details page and follow a verified chef you like.
              </p>
              <Link to="/meals" className="btn-primary mt-5 inline-flex">
                Browse Meals
              </Link>
            </div>
          ) : null}

          {!loading && !errorMessage && followedChefs.length > 0 ? (
            <section className="mt-8 space-y-6">
              {followedChefs.map((chef) => (
                <div
                  key={chef.id}
                  className="rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-5 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-sm font-semibold text-slate-500">
                        {chef.profileImageUrl ? (
                          <img
                            src={getFullImageUrl(chef.profileImageUrl)}
                            alt={chef.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          "Chef"
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {chef.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {chef.specialty || "Homemade food"} •{" "}
                          {chef.serviceArea || "Local area"}
                        </p>
                        <span className="mt-2 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          Verified Chef
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnfollowChef(chef.id)}
                      disabled={unfollowLoadingId === chef.id}
                      className="w-fit rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {unfollowLoadingId === chef.id
                        ? "Unfollowing..."
                        : "Unfollow"}
                    </button>
                  </div>

                  <div className="px-6 py-6">
                    <h4 className="text-base font-semibold text-slate-900">
                      Approved Meals From This Chef
                    </h4>

                    {!chef.meals || chef.meals.length === 0 ? (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-sm text-slate-500">
                          This chef has no approved public meals right now.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {chef.meals.map((meal) => (
                          <div
                            key={meal.id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                          >
                            {meal.imageUrl ? (
                              <img
                                src={getFullImageUrl(meal.imageUrl)}
                                alt={meal.name}
                                className="aspect-[4/3] w-full object-cover"
                              />
                            ) : (
                              <div className="flex aspect-[4/3] w-full items-center justify-center text-sm text-slate-400">
                                No photo
                              </div>
                            )}

                            <div className="p-4">
                              <div className="flex items-center justify-between gap-3">
                                <h5 className="text-sm font-semibold text-slate-900">
                                  {meal.name}
                                </h5>
                                <span className="text-sm font-semibold text-slate-900">
                                  {formatCurrency(meal.price)}
                                </span>
                              </div>

                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                {meal.description}
                              </p>

                              <Link
                                to={`/meals/${meal.id}`}
                                className="mt-4 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                              >
                                View Meal
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

export default CustomerFollowingPage;