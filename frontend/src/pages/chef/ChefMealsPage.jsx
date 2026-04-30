import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardTopbar from "../../components/layout/DashboardTopbar";
import {
  createMeal,
  deleteMeal,
  getChefMeals,
  updateMeal,
} from "../../services/mealService";
import {
  getFullImageUrl,
  uploadSingleImage,
} from "../../services/uploadService";

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

const initialFormState = {
  name: "",
  description: "",
  price: "",
  availability: true,
  imageUrl: "",
};

function ChefMealsPage() {
  const [meals, setMeals] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingMealId, setEditingMealId] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const savedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("smartmealUser")) || null;
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token || !savedUser) {
        setErrorMessage("Please login first to manage meals.");
        setLoading(false);
        return;
      }

      if (savedUser.role !== "chef") {
        setErrorMessage("Only chef accounts can manage meals.");
        setLoading(false);
        return;
      }

      const data = await getChefMeals(token);
      setMeals(data.meals || []);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to fetch your meals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const stats = useMemo(() => {
    return {
      total: meals.length,
      pending: meals.filter((meal) => meal.moderationStatus === "pending")
        .length,
      approved: meals.filter((meal) => meal.moderationStatus === "approved")
        .length,
      rejected: meals.filter((meal) => meal.moderationStatus === "rejected")
        .length,
    };
  }, [meals]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingMealId(null);
    setSelectedImageFile(null);
    setImagePreviewUrl("");
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    setErrorMessage("");

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 3MB.");
      return;
    }

    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleEditMeal = (meal) => {
    setEditingMealId(meal.id);
    setFormData({
      name: meal.name || "",
      description: meal.description || "",
      price: meal.price || "",
      availability: Boolean(meal.availability),
      imageUrl: meal.imageUrl || "",
    });
    setSelectedImageFile(null);
    setImagePreviewUrl(meal.imageUrl ? getFullImageUrl(meal.imageUrl) : "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token) {
        setErrorMessage("Please login first.");
        return;
      }

      if (!formData.name.trim()) {
        setErrorMessage("Meal name is required.");
        return;
      }

      if (!formData.description.trim()) {
        setErrorMessage("Meal description is required.");
        return;
      }

      if (!formData.price || Number(formData.price) <= 0) {
        setErrorMessage("Please enter a valid meal price.");
        return;
      }

      let finalImageUrl = formData.imageUrl;

      if (selectedImageFile) {
        const uploadData = await uploadSingleImage(selectedImageFile, token);
        finalImageUrl = uploadData.imageUrl;
      }

      if (!finalImageUrl) {
        setErrorMessage(
          "Please upload a real prepared meal photo before saving."
        );
        return;
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        availability: Boolean(formData.availability),
        imageUrl: finalImageUrl,
        imageAspectRatio: "4:3",
      };

      if (editingMealId) {
        await updateMeal(editingMealId, payload, token);
        setSuccessMessage(
          "Meal updated successfully and may require admin review."
        );
      } else {
        await createMeal(payload, token);
        setSuccessMessage(
          "Meal created successfully and submitted for admin review."
        );
      }

      resetForm();
      await fetchMeals();

      setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to save meal."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      setDeleteLoadingId(mealId);
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token) {
        setErrorMessage("Please login first.");
        return;
      }

      await deleteMeal(mealId, token);

      setSuccessMessage("Meal deleted successfully.");
      await fetchMeals();

      setTimeout(() => {
        setSuccessMessage("");
      }, 2200);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to delete meal."
      );
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role="chef" />

      <div className="flex-1">
        <DashboardTopbar
          title="My Meals"
          subtitle="Create, upload real prepared meal photos, manage availability, and submit homemade meals for admin moderation."
          actionLabel="View Orders"
          actionPath="/chef/orders"
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

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="dashboard-card">
              <p className="text-sm font-medium text-slate-500">
                Total Meals
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                {String(stats.total).padStart(2, "0")}
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                All meal listings created by you.
              </p>
            </div>

            <div className="dashboard-card">
              <p className="text-sm font-medium text-slate-500">
                Pending Review
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                {String(stats.pending).padStart(2, "0")}
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Meals waiting for admin moderation.
              </p>
            </div>

            <div className="dashboard-card">
              <p className="text-sm font-medium text-slate-500">
                Approved Meals
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                {String(stats.approved).padStart(2, "0")}
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
                {String(stats.rejected).padStart(2, "0")}
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Meals that need correction.
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={handleSubmit} className="panel-soft">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {editingMealId ? "Edit Meal" : "Create New Meal"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Upload an original prepared meal photo. SmartMeal uses a 4:3
                  image style across the marketplace for visual consistency.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Meal Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Example: Homemade Chicken Biryani"
                    className="input-soft"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe ingredients, portion, freshness, and serving details..."
                    className="textarea-soft"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Price in PKR
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="850"
                    className="input-soft"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label
                    htmlFor="meal-image"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Meal Photo Upload
                  </label>

                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-4">
                    <div className="overflow-hidden rounded-[24px] bg-white shadow-sm">
                      {imagePreviewUrl ? (
                        <img
                          src={imagePreviewUrl}
                          alt="Meal preview"
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 px-6 text-center">
                          <p className="text-sm font-semibold text-slate-700">
                            Upload real prepared meal photo
                          </p>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            JPG, PNG, or WEBP. Max 3MB. Marketplace preview
                            uses 4:3 ratio.
                          </p>
                        </div>
                      )}
                    </div>

                    <input
                      id="meal-image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                      disabled={submitting}
                    />

                    {formData.imageUrl && !selectedImageFile ? (
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Current saved image will be used unless you upload a new
                        one.
                      </p>
                    ) : null}
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    name="availability"
                    checked={formData.availability}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 rounded border-slate-300 accent-slate-900"
                    disabled={submitting}
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Mark meal as available
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Rejected meals are automatically made unavailable by admin.
                    </p>
                  </div>
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                  >
                    {submitting
                      ? "Saving..."
                      : editingMealId
                      ? "Update Meal"
                      : "Create Meal"}
                  </button>

                  {editingMealId ? (
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={submitting}
                      className="btn-secondary"
                    >
                      Cancel Edit
                    </button>
                  ) : null}
                </div>
              </div>
            </form>

            <div className="panel-soft relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100/70 blur-3xl" />

              <div className="relative">
                <p className="badge-soft w-fit">Upload guidance</p>

                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
                  Keep meal photos real, clean, and consistent.
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Use original photos of food you prepared. Avoid copied,
                  misleading, blurry, or unrelated images. Admin can reject
                  suspicious listings.
                </p>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      Recommended ratio
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Use landscape photos. The app displays them as 4:3 cards.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      File size
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Max upload size is 3MB for faster loading.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      Moderation
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      New meals are reviewed by admin before they become public.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            {loading ? (
              <div className="loading-shell">
                <p className="text-sm font-semibold text-slate-500">
                  Loading your meals...
                </p>
              </div>
            ) : null}

            {!loading && meals.length === 0 ? (
              <div className="empty-state">
                <p className="text-xl font-semibold text-slate-900">
                  No meals created yet
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Create your first homemade meal and submit it for admin
                  approval.
                </p>
              </div>
            ) : null}

            {!loading && meals.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative bg-slate-100">
                      {meal.imageUrl ? (
                        <img
                          src={getFullImageUrl(meal.imageUrl)}
                          alt={meal.name}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 text-sm text-slate-400">
                          No meal photo
                        </div>
                      )}

                      <div className="absolute left-4 top-4">
                        <span
                          className={getModerationBadge(
                            meal.moderationStatus || "pending"
                          )}
                        >
                          {formatStatus(meal.moderationStatus || "pending")}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {meal.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {meal.availability ? "Available" : "Unavailable"}
                          </p>
                        </div>

                        <p className="text-base font-semibold text-slate-900">
                          {formatCurrency(meal.price)}
                        </p>
                      </div>

                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-500">
                        {meal.description}
                      </p>

                      {meal.moderationStatus === "rejected" &&
                      meal.moderationNote ? (
                        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                          <p className="text-sm font-semibold text-red-700">
                            Rejection note
                          </p>
                          <p className="mt-2 text-sm leading-6 text-red-600">
                            {meal.moderationNote}
                          </p>
                        </div>
                      ) : null}

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleEditMeal(meal)}
                          className="btn-secondary"
                        >
                          Edit Meal
                        </button>

                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          disabled={deleteLoadingId === meal.id}
                          className="btn-danger"
                        >
                          {deleteLoadingId === meal.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}

export default ChefMealsPage;