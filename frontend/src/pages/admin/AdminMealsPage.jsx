import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardTopbar from "../../components/layout/DashboardTopbar";
import api from "../../services/api";

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toFixed(0)}`;
}

function formatStatus(status) {
  if (!status) {
    return "Pending";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getModerationBadge(status) {
  if (status === "approved") {
    return "badge-success";
  }

  if (status === "rejected") {
    return "badge-danger";
  }

  return "badge-warning";
}

function AdminMealsPage() {
  const [meals, setMeals] = useState([]);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [activeFilter, setActiveFilter] = useState("pending");
  const [moderationNote, setModerationNote] = useState("");
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token) {
        setErrorMessage("Please login first.");
        setLoading(false);
        return;
      }

      const response = await api.get("/admin/meals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMeals(response.data.meals || []);
      setCounts(
        response.data.counts || {
          pending: 0,
          approved: 0,
          rejected: 0,
        }
      );
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to fetch admin meals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const filteredMeals = useMemo(() => {
    if (activeFilter === "all") {
      return meals;
    }

    return meals.filter((meal) => meal.moderationStatus === activeFilter);
  }, [meals, activeFilter]);

  const handleApproveMeal = async (mealId) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setActionLoadingId(mealId);

      const token = localStorage.getItem("smartmealToken");

      await api.put(
        `/admin/meals/${mealId}/moderation`,
        {
          moderationStatus: "approved",
          moderationNote: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Meal approved successfully.");
      setSelectedMealId(null);
      setModerationNote("");
      await fetchMeals();

      setTimeout(() => {
        setSuccessMessage("");
      }, 2200);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to approve meal."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectMeal = async (mealId) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (!moderationNote.trim()) {
        setErrorMessage("Please write a rejection reason before rejecting.");
        setSelectedMealId(mealId);
        return;
      }

      setActionLoadingId(mealId);

      const token = localStorage.getItem("smartmealToken");

      await api.put(
        `/admin/meals/${mealId}/moderation`,
        {
          moderationStatus: "rejected",
          moderationNote: moderationNote.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Meal rejected successfully.");
      setSelectedMealId(null);
      setModerationNote("");
      await fetchMeals();

      setTimeout(() => {
        setSuccessMessage("");
      }, 2200);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to reject meal."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setDeleteLoadingId(mealId);

      const token = localStorage.getItem("smartmealToken");

      await api.delete(`/admin/meals/${mealId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage("Meal removed successfully.");
      await fetchMeals();

      setTimeout(() => {
        setSuccessMessage("");
      }, 2200);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to remove meal."
      );
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const filterTabs = [
    {
      key: "pending",
      label: "Pending Review",
      count: counts.pending || 0,
    },
    {
      key: "approved",
      label: "Approved",
      count: counts.approved || 0,
    },
    {
      key: "rejected",
      label: "Rejected",
      count: counts.rejected || 0,
    },
    {
      key: "all",
      label: "All Meals",
      count: meals.length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role="admin" />

      <div className="flex-1">
        <DashboardTopbar
          title="Meal Moderation"
          subtitle="Review chef meal listings, approve real prepared meal photos, reject suspicious listings, and keep the marketplace trustworthy."
          actionLabel="Back to Admin"
          actionPath="/admin/dashboard"
        />

        <main className="p-6 sm:p-8">
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

          {loading ? (
            <div className="loading-shell">
              <p className="text-sm font-semibold text-slate-500">
                Loading meal moderation queue...
              </p>
            </div>
          ) : null}

          {!loading ? (
            <>
              <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Pending Review
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {String(counts.pending || 0).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Meals waiting for admin approval.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Approved Meals
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {String(counts.approved || 0).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Meals visible to customers.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Rejected Meals
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {String(counts.rejected || 0).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Meals not approved for public listing.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Total Listings
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {String(meals.length || 0).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    All chef-created meal listings.
                  </p>
                </div>
              </section>

              <section className="mt-8 panel-soft">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Moderation Queue
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Approved meals are public. Rejected meals are removed from
                      availability. Pending meals still require review.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {filterTabs.map((tab) => {
                      const active = activeFilter === tab.key;

                      return (
                        <button
                          key={tab.key}
                          onClick={() => {
                            setActiveFilter(tab.key);
                            setSelectedMealId(null);
                            setModerationNote("");
                          }}
                          className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-300 ${
                            active
                              ? "bg-slate-900 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="mt-8">
                {filteredMeals.length === 0 ? (
                  <div className="empty-state">
                    <p className="text-lg font-semibold text-slate-900">
                      No meals found
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      There are no meals in this moderation category right now.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 xl:grid-cols-2">
                    {filteredMeals.map((meal) => {
                      const isPending = meal.moderationStatus === "pending";
                      const isApproved = meal.moderationStatus === "approved";
                      const isRejected = meal.moderationStatus === "rejected";

                      return (
                        <div
                          key={meal.id}
                          className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70"
                        >
                          <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
                            <div className="relative min-h-[240px] bg-slate-100">
                              {meal.imageUrl ? (
                                <img
                                  src={meal.imageUrl}
                                  alt={meal.name}
                                  className="h-full min-h-[240px] w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full min-h-[240px] w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 text-sm text-slate-400">
                                  No meal photo
                                </div>
                              )}

                              <div className="absolute left-4 top-4">
                                <span
                                  className={getModerationBadge(
                                    meal.moderationStatus || "pending"
                                  )}
                                >
                                  {formatStatus(
                                    meal.moderationStatus || "pending"
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="p-6">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <h3 className="text-xl font-semibold text-slate-900">
                                    {meal.name}
                                  </h3>

                                  <p className="mt-2 text-sm text-slate-500">
                                    {meal.chef?.name || "Unknown Chef"} •{" "}
                                    {meal.chef?.serviceArea || "Local area"}
                                  </p>
                                </div>

                                <p className="text-lg font-semibold text-slate-900">
                                  {formatCurrency(meal.price)}
                                </p>
                              </div>

                              <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-500">
                                {meal.description}
                              </p>

                              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Availability
                                  </p>
                                  <p className="mt-2 text-sm font-semibold text-slate-900">
                                    {meal.availability
                                      ? "Available"
                                      : "Unavailable"}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Chef Status
                                  </p>
                                  <p className="mt-2 text-sm font-semibold text-slate-900">
                                    {formatStatus(
                                      meal.chef?.approvalStatus || "pending"
                                    )}
                                  </p>
                                </div>
                              </div>

                              {isRejected && meal.moderationNote ? (
                                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                                  <p className="text-sm font-semibold text-red-700">
                                    Rejection note
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-red-600">
                                    {meal.moderationNote}
                                  </p>
                                </div>
                              ) : null}

                              {selectedMealId === meal.id ? (
                                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                                  <label
                                    htmlFor={`moderation-note-${meal.id}`}
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                  >
                                    Rejection Reason
                                  </label>

                                  <textarea
                                    id={`moderation-note-${meal.id}`}
                                    rows="4"
                                    value={moderationNote}
                                    onChange={(event) =>
                                      setModerationNote(event.target.value)
                                    }
                                    placeholder="Explain why this meal is being rejected..."
                                    className="textarea-soft bg-white"
                                  />

                                  <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                      onClick={() => handleRejectMeal(meal.id)}
                                      disabled={actionLoadingId === meal.id}
                                      className="btn-danger"
                                    >
                                      {actionLoadingId === meal.id
                                        ? "Rejecting..."
                                        : "Confirm Reject"}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setSelectedMealId(null);
                                        setModerationNote("");
                                      }}
                                      className="btn-secondary"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : null}

                              <div className="mt-6 flex flex-wrap gap-3">
                                {isPending || isRejected ? (
                                  <button
                                    onClick={() => handleApproveMeal(meal.id)}
                                    disabled={actionLoadingId === meal.id}
                                    className="btn-primary"
                                  >
                                    {actionLoadingId === meal.id
                                      ? "Approving..."
                                      : isRejected
                                      ? "Approve Again"
                                      : "Approve Meal"}
                                  </button>
                                ) : null}

                                {isPending || isApproved ? (
                                  <button
                                    onClick={() => {
                                      setSelectedMealId(meal.id);
                                      setModerationNote(
                                        meal.moderationNote || ""
                                      );
                                    }}
                                    disabled={actionLoadingId === meal.id}
                                    className="btn-danger"
                                  >
                                    {isApproved
                                      ? "Reject / Remove Approval"
                                      : "Reject Meal"}
                                  </button>
                                ) : null}

                                <button
                                  onClick={() => handleDeleteMeal(meal.id)}
                                  disabled={deleteLoadingId === meal.id}
                                  className="btn-secondary"
                                >
                                  {deleteLoadingId === meal.id
                                    ? "Removing..."
                                    : "Remove Listing"}
                                </button>
                              </div>

                              {!isPending ? (
                                <p className="mt-5 text-xs leading-5 text-slate-400">
                                  This meal is not in the pending queue anymore.
                                  Its current moderation state is{" "}
                                  {formatStatus(meal.moderationStatus)}.
                                </p>
                              ) : null}
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

export default AdminMealsPage;