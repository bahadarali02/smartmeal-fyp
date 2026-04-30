import React, { useMemo, useState } from "react";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import DashboardTopbar from "../components/layout/DashboardTopbar";
import api from "../services/api";
import { getFullImageUrl, uploadSingleImage } from "../services/uploadService";

const initialPasswordState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

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

function ProfileSettingsPage() {
  const savedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("smartmealUser")) || null;
  }, []);

  const role = savedUser?.role || "customer";

  const [profileForm, setProfileForm] = useState({
    name: savedUser?.name || "",
    email: savedUser?.email || "",
    phone: savedUser?.phone || "",
    address: savedUser?.address || "",
    specialty: savedUser?.specialty || "",
    serviceArea: savedUser?.serviceArea || "",
    profileImageUrl: savedUser?.profileImageUrl || "",
    cnicImageUrl: savedUser?.cnicImageUrl || "",
  });

  const [passwordForm, setPasswordForm] = useState(initialPasswordState);

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [cnicImageFile, setCnicImageFile] = useState(null);

  const [profileImagePreview, setProfileImagePreview] = useState(
    savedUser?.profileImageUrl ? getFullImageUrl(savedUser.profileImageUrl) : ""
  );

  const [cnicImagePreview, setCnicImagePreview] = useState(
    savedUser?.cnicImageUrl ? getFullImageUrl(savedUser.cnicImageUrl) : ""
  );

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const validateImageFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return "Please upload a JPG, PNG, or WEBP image.";
    }

    if (file.size > 3 * 1024 * 1024) {
      return "Image size must be less than 3MB.";
    }

    return "";
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    setErrorMessage("");

    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleCnicImageChange = (event) => {
    const file = event.target.files?.[0];

    setErrorMessage("");

    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setCnicImageFile(file);
    setCnicImagePreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token || !savedUser) {
        setErrorMessage("Please login first to update your profile.");
        return;
      }

      if (!profileForm.name.trim()) {
        setErrorMessage("Name is required.");
        return;
      }

      if (!profileForm.email.trim()) {
        setErrorMessage("Email is required.");
        return;
      }

      let finalProfileImageUrl = profileForm.profileImageUrl;
      let finalCnicImageUrl = profileForm.cnicImageUrl;

      if (profileImageFile) {
        const uploadData = await uploadSingleImage(profileImageFile, token);
        finalProfileImageUrl = uploadData.imageUrl;
      }

      if (cnicImageFile) {
        const uploadData = await uploadSingleImage(cnicImageFile, token);
        finalCnicImageUrl = uploadData.imageUrl;
      }

      const payload = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
        profileImageUrl: finalProfileImageUrl,
      };

      if (role === "chef") {
        payload.specialty = profileForm.specialty.trim();
        payload.serviceArea = profileForm.serviceArea.trim();
        payload.cnicImageUrl = finalCnicImageUrl;
      }

      const response = await api.put("/users/profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = response.data.user || {
        ...savedUser,
        ...payload,
      };

      localStorage.setItem("smartmealUser", JSON.stringify(updatedUser));

      setProfileForm((previousData) => ({
        ...previousData,
        profileImageUrl: finalProfileImageUrl,
        cnicImageUrl: finalCnicImageUrl,
      }));

      setProfileImageFile(null);
      setCnicImageFile(null);

      setSuccessMessage("Profile updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    try {
      setSavingPassword(true);
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token || !savedUser) {
        setErrorMessage("Please login first to update password.");
        return;
      }

      if (!passwordForm.currentPassword) {
        setErrorMessage("Current password is required.");
        return;
      }

      if (!passwordForm.newPassword) {
        setErrorMessage("New password is required.");
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setErrorMessage("New password must be at least 6 characters.");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setErrorMessage("New password and confirm password do not match.");
        return;
      }

      await api.put(
        "/users/password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordForm(initialPasswordState);
      setSuccessMessage("Password updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to update password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role={role} />

      <div className="flex-1">
        <DashboardTopbar
          title="Profile Settings"
          subtitle="Update your account information, profile photo, local address, and security details."
          actionLabel="Back to Dashboard"
          actionPath={getDashboardPath(role)}
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

          <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={handleProfileSubmit} className="panel-soft">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Account Profile
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Keep your SmartMeal profile accurate so orders, chef
                  verification, and local delivery stay clear.
                </p>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="profile-image"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Profile Photo
                </label>

                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[26px] bg-white text-lg font-semibold text-slate-500 shadow-sm">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (profileForm.name || "SM").slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        Upload a clear profile image
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        JPG, PNG, or WEBP. Max 3MB. This image appears in your
                        profile and chef/customer panels.
                      </p>

                      <input
                        id="profile-image"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleProfileImageChange}
                        className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                        disabled={savingProfile}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profileForm.name}
                    onChange={handleProfileInputChange}
                    placeholder="Your name"
                    className="input-soft"
                    disabled={savingProfile}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileInputChange}
                    placeholder="you@example.com"
                    className="input-soft"
                    disabled={savingProfile}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={profileForm.phone}
                    onChange={handleProfileInputChange}
                    placeholder="03xx xxxxxxx"
                    className="input-soft"
                    disabled={savingProfile}
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={profileForm.address}
                    onChange={handleProfileInputChange}
                    placeholder="Your local address"
                    className="input-soft"
                    disabled={savingProfile}
                  />
                </div>
              </div>

              {role === "chef" ? (
                <div className="mt-6 rounded-[30px] border border-slate-200 bg-slate-50 p-5">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">
                      Chef Verification Details
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      These details help admin review your chef profile and help
                      customers understand your local service area.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="specialty"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Specialty / Cuisine
                      </label>
                      <input
                        id="specialty"
                        name="specialty"
                        type="text"
                        value={profileForm.specialty}
                        onChange={handleProfileInputChange}
                        placeholder="Example: Desi food, Biryani, Healthy meals"
                        className="input-soft bg-white"
                        disabled={savingProfile}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="serviceArea"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Service Area
                      </label>
                      <input
                        id="serviceArea"
                        name="serviceArea"
                        type="text"
                        value={profileForm.serviceArea}
                        onChange={handleProfileInputChange}
                        placeholder="Example: Khanewal, Multan Road"
                        className="input-soft bg-white"
                        disabled={savingProfile}
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="cnic-image"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      CNIC / ID Image
                    </label>

                    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-4">
                      <div className="overflow-hidden rounded-[24px] bg-slate-50 shadow-sm">
                        {cnicImagePreview ? (
                          <img
                            src={cnicImagePreview}
                            alt="CNIC preview"
                            className="aspect-[4/3] w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 px-6 text-center">
                            <p className="text-sm font-semibold text-slate-700">
                              Upload CNIC / ID image
                            </p>
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              This is for admin review only. JPG, PNG, or WEBP.
                              Max 3MB.
                            </p>
                          </div>
                        )}
                      </div>

                      <input
                        id="cnic-image"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleCnicImageChange}
                        className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                        disabled={savingProfile}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary"
                >
                  {savingProfile ? "Saving Profile..." : "Save Profile"}
                </button>
              </div>
            </form>

            <div className="space-y-8">
              <form onSubmit={handlePasswordSubmit} className="panel-soft">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Password Security
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Update your password to keep your SmartMeal account secure.
                  </p>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter current password"
                      className="input-soft"
                      disabled={savingPassword}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="At least 6 characters"
                      className="input-soft"
                      disabled={savingPassword}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Confirm new password"
                      className="input-soft"
                      disabled={savingPassword}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="btn-secondary"
                  >
                    {savingPassword ? "Updating Password..." : "Update Password"}
                  </button>
                </div>
              </form>

              <div className="panel-soft relative overflow-hidden">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100/70 blur-3xl" />

                <div className="relative">
                  <p className="badge-soft w-fit">Profile guidance</p>

                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
                    Keep your local marketplace profile complete.
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    Accurate phone, address, and service area information makes
                    SmartMeal more realistic and easier to use for local
                    homemade food ordering.
                  </p>

                  <div className="mt-6 grid gap-4">
                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">
                        Customers
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Keep your delivery address updated before placing
                        orders.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">
                        Chefs
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Add a specialty, service area, profile photo, and CNIC
                        image for a complete verification profile.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">
                        Local delivery
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        SmartMeal works best when users stay within nearby
                        service areas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ProfileSettingsPage;