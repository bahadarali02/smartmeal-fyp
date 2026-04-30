import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { registerUser } from "../../services/authService";

function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    phone: "",
    address: "",
    profileImageUrl: "",
    cnicImageUrl: "",
    specialty: "",
    serviceArea: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isChefSignup = formData.role === "chef";

  const handleChange = (event) => {
    const { id, value } = event.target;

    setFormData((previousState) => ({
      ...previousState,
      [id]: value,
    }));
  };

  const redirectByRole = (role, approvalStatus) => {
    if (role === "customer") {
      navigate("/customer/dashboard");
      return;
    }

    if (role === "chef") {
      if (approvalStatus === "approved") {
        navigate("/chef/dashboard");
        return;
      }

      navigate("/login");
      return;
    }

    navigate("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.password
    ) {
      setErrorMessage("Please fill in name, email, role, and password.");
      return;
    }

    if (isChefSignup) {
      if (
        !formData.phone ||
        !formData.address ||
        !formData.specialty ||
        !formData.serviceArea ||
        !formData.cnicImageUrl
      ) {
        setErrorMessage(
          "Chef signup requires phone, address, specialty, service area, and CNIC/ID image URL."
        );
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        phone: formData.phone || null,
        address: formData.address || null,
        profileImageUrl: formData.profileImageUrl || null,
        cnicImageUrl: formData.cnicImageUrl || null,
        specialty: formData.specialty || null,
        serviceArea: formData.serviceArea || null,
      };

      const data = await registerUser(payload);

      localStorage.setItem("smartmealToken", data.token);
      localStorage.setItem("smartmealUser", JSON.stringify(data.user));

      if (data.user.role === "chef" && data.user.approvalStatus !== "approved") {
        setSuccessMessage(
          "Chef account created successfully. Your account is pending admin approval. Please wait before accessing chef features."
        );

        setTimeout(() => {
          localStorage.removeItem("smartmealToken");
          localStorage.removeItem("smartmealUser");
          navigate("/login");
        }, 1500);

        return;
      }

      setSuccessMessage("Account created successfully. Redirecting...");

      setTimeout(() => {
        redirectByRole(data.user.role, data.user.approvalStatus);
      }, 800);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join SmartMeal as a customer or apply as a verified home chef for local homemade food delivery."
      footerText="Already have an account?"
      footerLinkText="Login"
      footerLinkTo="/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Select Role
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="">Choose your role</option>
            <option value="customer">Customer</option>
            <option value="chef">Home Chef</option>
          </select>
        </div>

        {isChefSignup ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">
              Chef verification required
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Chef accounts are reviewed by admin before they can create meals
              or receive orders. Use real local service details.
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="e.g. 03001234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="specialty"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Specialty / Cuisine
                </label>
                <input
                  id="specialty"
                  type="text"
                  placeholder="e.g. Pakistani food, Biryani, Desi meals"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="serviceArea"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Service Area
                </label>
                <input
                  id="serviceArea"
                  type="text"
                  placeholder="e.g. Talamba, Multan Road, nearby local area"
                  value={formData.serviceArea}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Address
                </label>
                <textarea
                  id="address"
                  rows="3"
                  placeholder="Enter your complete local address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="profileImageUrl"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Profile Picture URL
                </label>
                <input
                  id="profileImageUrl"
                  type="text"
                  placeholder="Paste profile image URL"
                  value={formData.profileImageUrl}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="cnicImageUrl"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  CNIC / ID Image URL
                </label>
                <input
                  id="cnicImageUrl"
                  type="text"
                  placeholder="Paste CNIC or ID image URL"
                  value={formData.cnicImageUrl}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Local marketplace account
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Customer accounts can order immediately. Chef accounts require admin
            approval before accessing chef features.
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            Back to home
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default SignupPage;